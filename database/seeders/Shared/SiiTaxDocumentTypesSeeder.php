<?php

namespace Database\Seeders\Shared;

use App\Models\Shared\SiiTaxDocumentType;
use Illuminate\Database\Seeder;

/**
 * Catálogo SII fusionado por código: un registro por código tributario.
 * Nombres compartidos IEV/IEC: se toma siempre el texto de IEV si existe; si el código es solo IEC, el nombre viene de IEC.
 *
 * Abreviaturas internas (no todas figuran en normativa como siglas oficiales).
 */
class SiiTaxDocumentTypesSeeder extends Seeder
{
    /**
     * @return list<array{0: string, 1: string}>
     */
    private static function ievRows(): array
    {
        return [
            ['30', 'Factura'],
            ['32', 'Factura de ventas y servicios no afectos o exentos de IVA'],
            ['33', 'Factura Electrónica'],
            ['34', 'Factura no Afecta o Exenta Electrónica'],
            ['35', 'Total operaciones del mes, con boleta (afecta)'],
            ['38', 'Total operaciones del mes con boleta no afecta o exenta'],
            ['39', 'Total operaciones del mes, con boleta electrónica'],
            ['40', 'Liquidación factura'],
            ['41', 'Total operaciones del mes, con boleta no afecta o exenta electrónica'],
            ['43', 'Liquidación-Factura Electrónica'],
            ['45', 'Factura de Compra'],
            ['46', 'Factura de Compra electrónica'],
            ['55', 'Nota de débito'],
            ['56', 'Nota de débito electrónica'],
            ['60', 'Nota de Crédito'],
            ['61', 'Nota de crédito electrónica'],
            ['101', 'Factura de exportación'],
            ['102', 'Factura de venta exenta a zona franca primaria (Res. Ex. N° 601 de 07.05.82)'],
            ['103', 'Liquidación'],
            ['104', 'Nota de débito de exportación'],
            ['105', 'Boleta liquidación (Res. Ex. N° 1423 del 23.12.76)'],
            ['106', 'Nota de Crédito de exportación'],
            ['108', 'SRF Solicitud Registro de Factura'],
            ['109', 'Factura a turista (Res. Ex. N° 6428 de 06.12.93)'],
            ['110', 'Factura de Exportación Electrónica'],
            ['111', 'Nota de Débito de Exportación Electrónica'],
            ['112', 'Nota de Crédito de Exportación Electrónica'],
            ['901', 'Factura de ventas a empresas del territorio preferencial ( Res. Ex. N°1057, del 25.04.85)'],
            ['902', 'Conocimiento de Embarque (Marítimo o aéreo)'],
            ['903', 'Documento único de Salida (DUS)'],
            ['919', 'Resumen ventas de nacionales pasajes sin Factura'],
            ['920', 'Otros registros no documentados Aumenta débito'],
            ['922', 'Otros registros. Disminuye débito.'],
            ['924', 'Resumen ventas de internacionales pasajes sin Factura'],
            ['904', 'Factura de Traspaso'],
            ['905', 'Factura de Reexpedición'],
            ['906', 'Boletas Venta Módulos ZF (todas)'],
            ['907', 'Facturas Venta Módulo ZF (todas)'],
        ];
    }

    /**
     * @return list<array{0: string, 1: string}>
     */
    private static function iecRows(): array
    {
        return [
            ['30', 'Factura'],
            ['32', 'Factura de ventas y servicios no afectos o exentos de IVA'],
            ['33', 'Factura Electrónica'],
            ['34', 'Factura no Afecta o Exenta Electrónica'],
            ['40', 'Liquidación Factura'],
            ['43', 'Liquidación Factura Electrónica'],
            ['45', 'Factura de Compra'],
            ['46', 'Factura de Compra electrónica'],
            ['55', 'Nota de Débito'],
            ['56', 'Nota de débito electrónica'],
            ['60', 'Nota de Crédito'],
            ['61', 'Nota de crédito electrónica'],
            ['108', 'SRF Solicitud de Registro de Factura'],
            ['901', 'Factura de ventas a empresas del territorio preferencial (Res. Ex. N° 1057, del 25.04.85)'],
            ['914', 'Declaración de Ingreso (DIN)'],
            ['911', 'Declaración de Ingreso a Zona Franca Primaria'],
            ['904', 'Factura de Traspaso'],
            ['909', 'Facturas Venta Módulo ZF'],
            ['910', 'Solicitud Traslado Zona Franca (Z)'],
        ];
    }

    /**
     * @return array<string, string>
     */
    private static function abbreviationsByCode(): array
    {
        return [
            '30' => 'FA',
            '32' => 'FVNE',
            '33' => 'FAE',
            '34' => 'FEE',
            '35' => 'TOM-BA',
            '38' => 'TOM-BNE',
            '39' => 'TOM-BE',
            '40' => 'LIQ-F',
            '41' => 'TOM-BNEE',
            '43' => 'LIQ-FE',
            '45' => 'FC',
            '46' => 'FCE',
            '55' => 'ND',
            '56' => 'NDE',
            '60' => 'NC',
            '61' => 'NCE',
            '101' => 'FEXP',
            '102' => 'FVZFP',
            '103' => 'LIQ',
            '104' => 'NDEXP',
            '105' => 'BLIQ',
            '106' => 'NCEXP',
            '108' => 'SRF',
            '109' => 'FTUR',
            '110' => 'FEXPE',
            '111' => 'NDEXPE',
            '112' => 'NCEXPE',
            '901' => 'FTP',
            '902' => 'CEMB',
            '903' => 'DUS',
            '919' => 'RVNPF',
            '920' => 'ORAD',
            '922' => 'ORDD',
            '924' => 'RVIPF',
            '904' => 'FTR',
            '905' => 'FRE',
            '906' => 'BVZF',
            '907' => 'FVZF',
            '914' => 'DIN',
            '909' => 'FVZFM',
            '910' => 'STZF',
            '911' => 'DIZFP',
        ];
    }

    /**
     * @return array<string, array{code: string, name: string, use_sale: bool, use_purchase: bool, abbreviation: string}>
     */
    private static function mergedRows(): array
    {
        $byCode = [];

        foreach (self::ievRows() as [$code, $name]) {
            $byCode[$code] = [
                'code' => $code,
                'name' => $name,
                'use_sale' => true,
                'use_purchase' => false,
                'abbreviation' => self::abbreviationsByCode()[$code]
                    ?? 'D'.$code,
            ];
        }

        foreach (self::iecRows() as [$code, $name]) {
            if (! isset($byCode[$code])) {
                $byCode[$code] = [
                    'code' => $code,
                    'name' => $name,
                    'use_sale' => false,
                    'use_purchase' => true,
                    'abbreviation' => self::abbreviationsByCode()[$code]
                        ?? 'D'.$code,
                ];
            } else {
                $byCode[$code]['use_purchase'] = true;
            }
        }

        return $byCode;
    }

    public function run(): void
    {
        foreach (self::mergedRows() as $row) {
            SiiTaxDocumentType::query()->updateOrCreate(
                ['code' => $row['code']],
                [
                    'name' => $row['name'],
                    'abbreviation' => $row['abbreviation'],
                    'use_sale' => $row['use_sale'],
                    'use_purchase' => $row['use_purchase'],
                ],
            );
        }
    }
}
