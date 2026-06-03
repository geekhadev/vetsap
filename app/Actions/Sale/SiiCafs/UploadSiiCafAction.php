<?php

namespace App\Actions\Sale\SiiCafs;

use App\Enums\CompanyDocumentType;
use App\Enums\Sale\SiiCafFolioStatus;
use App\Enums\Sale\SiiCafStatus;
use App\Models\Company;
use App\Models\Sale\SiiCaf;
use App\Models\Sale\SiiCafFolio;
use App\Models\Shared\SiiTaxDocumentType;
use App\Support\Sale\ChileRut;
use App\Support\Sale\CompanySiiBoletaCertificationReadiness;
use App\Support\Sii\SiiCafXmlParser;
use App\Support\Storage\CompanyPrivateStorageLayout;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use InvalidArgumentException;
use RuntimeException;

final class UploadSiiCafAction
{
    public function execute(Company $company, string $xmlContent): SiiCaf
    {
        if ($company->document_type !== CompanyDocumentType::Rut) {
            throw new InvalidArgumentException('La empresa debe tener RUT chileno para subir SII CAFs.');
        }

        if (! CompanySiiBoletaCertificationReadiness::assess($company)['ready']) {
            throw new InvalidArgumentException('La integración SII de la empresa no está completa.');
        }

        $parsed = SiiCafXmlParser::parse($xmlContent);

        if (ChileRut::normalize($parsed['RE']) !== ChileRut::normalize((string) $company->document_number)) {
            throw new InvalidArgumentException('El RUT del CAF no coincide con el RUT de la empresa seleccionada.');
        }

        /** @var SiiTaxDocumentType|null $docType */
        $docType = SiiTaxDocumentType::query()->where('code', $parsed['TD'])->first();
        if ($docType === null) {
            throw new InvalidArgumentException('El tipo de documento del CAF no existe en el catálogo SII.');
        }

        $folioFrom = $parsed['folio_from'];
        $folioTo = $parsed['folio_to'];

        $authorizedAt = CarbonImmutable::parse($parsed['authorized_on'])->startOfDay();
        $expiresAt = $authorizedAt->addMonths(6);

        $uploadedAt = now();

        return DB::transaction(function () use (
            $company,
            $xmlContent,
            $docType,
            $folioFrom,
            $folioTo,
            $authorizedAt,
            $expiresAt,
            $uploadedAt,
            $parsed,
        ): SiiCaf {
            $existing = SiiCaf::query()
                ->where('company_id', $company->id)
                ->where('sii_tax_document_type_id', $docType->id)
                ->lockForUpdate()
                ->get(['id', 'folio_from', 'folio_to']);

            foreach ($existing as $row) {
                if (! self::rangesAreDisjoint($folioFrom, $folioTo, $row->folio_from, $row->folio_to)) {
                    throw new InvalidArgumentException('El rango de folios se solapa con un CAF existente para el mismo tipo de documento.');
                }
            }

            $cafId = (string) Str::uuid();
            $relativePath = CompanyPrivateStorageLayout::siiCafXmlRelativePath($company->id, $cafId);

            if (! Storage::disk('local')->put($relativePath, $xmlContent)) {
                throw new RuntimeException('No se pudo guardar el archivo CAF en almacenamiento privado.');
            }

            $caf = SiiCaf::query()->create([
                'id' => $cafId,
                'company_id' => $company->id,
                'sii_tax_document_type_id' => $docType->id,
                'sii_document_type_code' => $parsed['TD'],
                'folio_from' => $folioFrom,
                'folio_to' => $folioTo,
                'authorized_at' => $authorizedAt->toDateString(),
                'expires_at' => $expiresAt->toDateString(),
                'status' => SiiCafStatus::Active,
                'xml_path' => $relativePath,
                'uploaded_at' => $uploadedAt,
            ]);

            self::insertFolioRows($caf->id, $company->id, $folioFrom, $folioTo);

            /** @var SiiCaf */
            return $caf->fresh(['siiTaxDocumentType']);
        });
    }

    private static function rangesAreDisjoint(int $aFrom, int $aTo, int $bFrom, int $bTo): bool
    {
        return $aTo < $bFrom || $bTo < $aFrom;
    }

    private static function insertFolioRows(string $cafId, string $companyId, int $from, int $to): void
    {
        $table = (new SiiCafFolio)->getTable();
        $now = now()->toDateTimeString();
        $status = SiiCafFolioStatus::Available->value;
        $batchSize = 500;
        $batch = [];

        for ($n = $from; $n <= $to; $n++) {
            $batch[] = [
                'id' => (string) Str::uuid(),
                'sale_sii_caf_id' => $cafId,
                'company_id' => $companyId,
                'folio_number' => $n,
                'status' => $status,
                'used_at' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ];

            if (count($batch) >= $batchSize) {
                DB::table($table)->insert($batch);
                $batch = [];
            }
        }

        if ($batch !== []) {
            DB::table($table)->insert($batch);
        }
    }
}
