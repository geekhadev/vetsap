<?php

namespace App\Actions\Sale\CertificationSiiTickets;

use App\Models\Company;
use App\Support\Integration\CompanySiiIntegrationSettingKeys;
use App\Support\Sale\BoletaCertificacionDocumentosPlantilla;
use App\Support\Sale\FoliosSkippingCafCryptoVerify;
use App\Support\Sale\PemBundleFromPkcs12;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use sasco\LibreDTE\FirmaElectronica;
use sasco\LibreDTE\Log;
use sasco\LibreDTE\LogMsg;
use sasco\LibreDTE\Sii;
use sasco\LibreDTE\Sii\ConsumoFolio;
use sasco\LibreDTE\Sii\Dte;
use sasco\LibreDTE\Sii\EnvioDte;

final class GenerateCertificationSiiBoletaXmlAction
{
    /**
     * @param  array<string, string>  $cafParsed  Resultado de {@see caf_xml_to_nodes()}
     * @return array{envio_xml: string, consumo_xml: string}
     */
    public function execute(Company $company, array $cafParsed, string $cafXmlOriginal): array
    {
        $byKey = $company->integrationSettings()->pluck('value', 'key')->all();

        Log::readAll();

        Sii::setAmbiente(Sii::CERTIFICACION);
        Sii::setServidor('maullin');

        $cafForFolios = $this->prepareCafXmlForLibreDteFolios($cafXmlOriginal);

        $tipo = (int) $cafParsed['TD'];
        $foliosObj = new FoliosSkippingCafCryptoVerify($cafForFolios);
        if ($foliosObj->getCaf() === false) {
            $this->throwLibreDteErrors();
        }

        $folios = [$tipo => $foliosObj];

        $firma = $this->createFirmaElectronica($byKey);

        $folioInicio = (int) $cafParsed['RNG']['D'];
        $folioFin = (int) $cafParsed['RNG']['H'];
        $cantidadFolios = $folioFin - $folioInicio + 1;

        $emisor = [
            'RUTEmisor' => $company->document_number,
            'RznSoc' => $company->name,
            'GiroEmis' => (string) ($byKey[CompanySiiIntegrationSettingKeys::GIRO] ?? ''),
            'Acteco' => (int) preg_replace('/\D/', '', (string) ($byKey[CompanySiiIntegrationSettingKeys::ACTECO] ?? '0')),
            'DirOrigen' => (string) ($byKey[CompanySiiIntegrationSettingKeys::DIRECTION] ?? ''),
            'CmnaOrigen' => (string) ($byKey[CompanySiiIntegrationSettingKeys::CITY] ?? ''),
        ];

        $receptor = [
            'RUTRecep' => '55666777-8',
            'RznSocRecep' => 'Cliente S.A.',
            'DirRecep' => 'Santiago',
            'CmnaRecep' => 'Santiago',
        ];

        $documentos = BoletaCertificacionDocumentosPlantilla::build(
            $emisor,
            $receptor,
            $folioInicio,
            $cantidadFolios,
        );

        $envio = new EnvioDte;
        $dtesFirmados = [];

        foreach ($documentos as $documento) {
            $dte = new Dte($documento);
            if (! $dte->timbrar($folios[$dte->getTipo()])) {
                $this->throwLibreDteErrors();
            }
            if (! $dte->firmar($firma)) {
                $this->throwLibreDteErrors();
            }
            if (! $envio->agregar($dte)) {
                $this->throwLibreDteErrors();
            }
            $dtesFirmados[] = $dte;
        }

        if (count($dtesFirmados) !== count($documentos)) {
            $this->throwLibreDteErrors();
        }

        if (! $this->skipEnvioDteXmlSignature()) {
            $envio->setFirma($firma);
        }

        $fchResol = CarbonImmutable::parse(
            (string) ($byKey[CompanySiiIntegrationSettingKeys::RESOLUTION_DATE_TICKETS] ?? ''),
        )->format('Y-m-d');
        $nroResol = (int) ($byKey[CompanySiiIntegrationSettingKeys::RESOLUTION_NUMBER_TICKETS] ?? 0);

        $caratulaEnvio = [
            'RutReceptor' => '60803000-K',
            'FchResol' => $fchResol,
            'NroResol' => $nroResol,
        ];

        if ($this->skipEnvioDteXmlSignature()) {
            $caratulaEnvio['RutEnvia'] = $firma->getID();
        }

        if (! $envio->setCaratula($caratulaEnvio)) {
            $this->throwLibreDteErrors();
        }

        $envio->generar();

        if (! $this->skipEnvioDteXmlSignature() && ! $envio->schemaValidate()) {
            $this->throwLibreDteErrors();
        }

        $envioXml = (string) $envio->generar();

        $consumo = new ConsumoFolio;
        $consumo->setDocumentos([$tipo]);
        foreach ($dtesFirmados as $dte) {
            $consumo->agregar($dte->getResumen());
        }
        $consumo->setFirma($firma);
        $consumo->setCaratula([
            'RutEmisor' => $emisor['RUTEmisor'],
            'FchResol' => $fchResol,
            'NroResol' => $nroResol,
        ]);
        $consumoXml = (string) $consumo->generar();

        if (! $consumo->schemaValidate()) {
            $this->throwLibreDteErrors();
        }

        return [
            'envio_xml' => $envioXml,
            'consumo_xml' => $consumoXml,
        ];
    }

    /**
     * @param  array<string, mixed>  $byKey
     */
    private function createFirmaElectronica(array $byKey): FirmaElectronica
    {
        $config = $this->firmaElectronicaConfig($byKey);
        $binary = $this->pkcs12BinaryFromFirmaConfig($config);
        $pem = PemBundleFromPkcs12::tryExtract($binary, $config['pass']);

        $firma = $pem !== null
            ? new FirmaElectronica(['cert' => $pem['cert'], 'pkey' => $pem['pkey']])
            : new FirmaElectronica($config);

        try {
            $firma->check();
        } catch (\Throwable $e) {
            throw new RuntimeException(
                'No se pudo usar el certificado PKCS#12 (.pfx o .p12). Revisa la contraseña guardada en integración SII y que el archivo sea el export completo del proveedor. Detalle: '.$e->getMessage(),
                0,
                $e
            );
        }

        return $firma;
    }

    /**
     * @param  array{file?: string, data?: string, pass: string}  $config
     */
    private function pkcs12BinaryFromFirmaConfig(array $config): string
    {
        if (isset($config['data']) && is_string($config['data']) && $config['data'] !== '') {
            return $config['data'];
        }

        if (isset($config['file']) && is_string($config['file']) && $config['file'] !== '') {
            $contents = @file_get_contents($config['file']);
            if ($contents === false || $contents === '') {
                throw new RuntimeException('No se pudo leer el archivo del certificado digital.');
            }

            return $contents;
        }

        throw new RuntimeException('La configuración del certificado digital no incluye archivo ni datos.');
    }

    /**
     * @param  array<string, mixed>  $byKey
     * @return array{file?: string, data?: string, pass: string}
     */
    private function firmaElectronicaConfig(array $byKey): array
    {
        $url = (string) ($byKey[CompanySiiIntegrationSettingKeys::CERTIFICATE_URL] ?? '');
        $pass = (string) ($byKey[CompanySiiIntegrationSettingKeys::CERTIFICATE_PASSWORD] ?? '');

        if ($url === '') {
            throw new RuntimeException('Falta la URL o ruta del certificado digital.');
        }

        if (str_starts_with($url, 'file://')) {
            $path = substr($url, strlen('file://'));
            $this->assertNonEmptyCertificateFile($path);

            return ['file' => $path, 'pass' => $pass];
        }

        if (is_file($url)) {
            $this->assertNonEmptyCertificateFile($url);

            return ['file' => $url, 'pass' => $pass];
        }

        if (filter_var($url, FILTER_VALIDATE_URL)) {
            $response = Http::timeout(60)->get($url);
            if (! $response->successful()) {
                throw new RuntimeException('No se pudo descargar el certificado digital.');
            }

            $body = $response->body();
            if ($body === '') {
                throw new RuntimeException('La descarga del certificado digital devolvió un cuerpo vacío.');
            }

            return ['data' => $body, 'pass' => $pass];
        }

        throw new RuntimeException('El certificado digital debe ser una ruta local, file:// o una URL http(s) válida.');
    }

    private function assertNonEmptyCertificateFile(string $path): void
    {
        if (! is_readable($path)) {
            throw new RuntimeException('No se puede leer el archivo del certificado digital: '.$path);
        }

        $size = @filesize($path);
        if ($size === false || $size === 0) {
            throw new RuntimeException('El archivo del certificado digital está vacío o no es accesible: '.$path);
        }
    }

    /**
     * Ajusta bytes del CAF para {@see Folios}: quita BOM UTF-8 y, si el archivo está en UTF-8,
     * lo pasa a ISO-8859-1 porque LibreDTE aplica {@see utf8_encode()} al cargar (espera Latin-1).
     * No re-codificar antes con iconv evita alterar firmas/claves cuando el archivo ya viene en Latin-1 del SII.
     */
    private function prepareCafXmlForLibreDteFolios(string $xml): string
    {
        if (str_starts_with($xml, "\xEF\xBB\xBF")) {
            $xml = substr($xml, 3);
        }

        if (mb_detect_encoding($xml, ['UTF-8'], true) !== 'UTF-8') {
            return $xml;
        }

        $latin1 = mb_convert_encoding($xml, 'ISO-8859-1', 'UTF-8');

        return ($latin1 !== false && $latin1 !== '') ? $latin1 : $xml;
    }

    private function throwLibreDteErrors(): void
    {
        $messages = [];
        $foliosLibreDteError = false;

        foreach (Log::readAll() as $error) {
            if ($error instanceof LogMsg) {
                $messages[] = $error->msg !== null && $error->msg !== ''
                    ? (string) $error->msg
                    : 'Error código '.$error->code;
                if (in_array($error->code, [701, 702, 703, 704], true)) {
                    $foliosLibreDteError = true;
                }
            } elseif (is_scalar($error)) {
                $messages[] = (string) $error;
            } else {
                $messages[] = json_encode($error);
            }
        }

        if ($foliosLibreDteError && ! config('sale.sii_boleta_certification.skip_caf_cryptographic_verification', false)) {
            $messages[] = 'El CAF no superó la verificación criptográfica del SII (firma o claves). Vuelve a descargar el XML desde el portal del SII sin editarlo. Si el archivo es el correcto, prueba actualizar libredte/libredte-lib-core (certificados públicos del SII incluidos en el paquete).';
        }

        throw new RuntimeException($messages === [] ? 'Error al generar XML con LibreDTE.' : implode(' ', $messages));
    }

    private function skipEnvioDteXmlSignature(): bool
    {
        return (bool) config('sale.sii_boleta_certification.skip_envio_dte_xml_signature', false);
    }
}
