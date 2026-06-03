<?php

namespace App\Support\Sale;

/**
 * Plantilla de documentos tipo 39 para certificación de boleta electrónica.
 * Casos alineados al set de pruebas del SII (referencias SET / CASO-n), ver guía de emisión de boleta.
 */
final class BoletaCertificacionDocumentosPlantilla
{
    /**
     * @param  array<string, mixed>  $emisor
     * @param  array<string, mixed>  $receptor
     * @return list<array<string, mixed>>
     */
    public static function build(array $emisor, array $receptor, int $folioInicio, int $cantidad): array
    {
        $base = self::casosBase();
        $limite = max(1, min($cantidad, count($base)));
        $casos = array_slice($base, 0, $limite);

        $documentos = [];
        foreach ($casos as $index => $documento) {
            $documento['Encabezado']['Emisor'] = $emisor;
            $documento['Encabezado']['Receptor'] = $receptor;
            $documento['Encabezado']['IdDoc']['TipoDTE'] = 39;
            $documento['Encabezado']['IdDoc']['Folio'] = $folioInicio + $index;
            $documentos[] = $documento;
        }

        return $documentos;
    }

    /**
     * @return list<array<string, mixed>>
     */
    private static function casosBase(): array
    {
        return [
            [
                'Encabezado' => [
                    'IdDoc' => [
                        'TipoDTE' => 39,
                        'Folio' => 0,
                    ],
                ],
                'Referencia' => [
                    'CodRef' => 'SET',
                    'RazonRef' => 'CASO-1',
                ],
                'Detalle' => [
                    [
                        'NmbItem' => 'Cambio de aceite',
                        'QtyItem' => 1,
                        'PrcItem' => 19900,
                    ],
                    [
                        'NmbItem' => 'Alineacion y balanceo',
                        'QtyItem' => 1,
                        'PrcItem' => 9900,
                    ],
                ],
            ],
            [
                'Encabezado' => [
                    'IdDoc' => [
                        'TipoDTE' => 39,
                        'Folio' => 0,
                    ],
                ],
                'Referencia' => [
                    'CodRef' => 'SET',
                    'RazonRef' => 'CASO-2',
                ],
                'Detalle' => [
                    [
                        'NmbItem' => 'Papel de regalo',
                        'QtyItem' => 17,
                        'PrcItem' => 120,
                    ],
                ],
            ],
            [
                'Encabezado' => [
                    'IdDoc' => [
                        'TipoDTE' => 39,
                        'Folio' => 0,
                    ],
                ],
                'Referencia' => [
                    'CodRef' => 'SET',
                    'RazonRef' => 'CASO-3',
                ],
                'Detalle' => [
                    [
                        'NmbItem' => 'Sandwic',
                        'QtyItem' => 2,
                        'PrcItem' => 1500,
                    ],
                    [
                        'NmbItem' => 'Bebida',
                        'QtyItem' => 2,
                        'PrcItem' => 550,
                    ],
                ],
            ],
            [
                'Encabezado' => [
                    'IdDoc' => [
                        'TipoDTE' => 39,
                        'Folio' => 0,
                    ],
                ],
                'Referencia' => [
                    'CodRef' => 'SET',
                    'RazonRef' => 'CASO-4',
                ],
                'Detalle' => [
                    [
                        'NmbItem' => 'item afecto 1',
                        'QtyItem' => 8,
                        'PrcItem' => 1590,
                    ],
                    [
                        'NmbItem' => 'item exento 2',
                        'QtyItem' => 2,
                        'IndExe' => 1,
                        'PrcItem' => 1000,
                    ],
                ],
            ],
            [
                'Encabezado' => [
                    'IdDoc' => [
                        'TipoDTE' => 39,
                        'Folio' => 0,
                    ],
                ],
                'Referencia' => [
                    'CodRef' => 'SET',
                    'RazonRef' => 'CASO-5',
                ],
                'Detalle' => [
                    [
                        'NmbItem' => 'Arroz',
                        'QtyItem' => 5,
                        'UnmdItem' => 'Kg',
                        'PrcItem' => 700,
                    ],
                ],
            ],
        ];
    }
}
