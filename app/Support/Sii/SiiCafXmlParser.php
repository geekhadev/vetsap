<?php

namespace App\Support\Sii;

use App\Support\Sale\CafXmlParser;
use InvalidArgumentException;

/**
 * Parser de CAF SII para el módulo de folios (cualquier TD soportado en catálogo).
 */
final class SiiCafXmlParser
{
    /**
     * @return array{
     *     RE: string,
     *     RS: string,
     *     TD: string,
     *     folio_from: int,
     *     folio_to: int,
     *     authorized_on: string,
     * }
     */
    public static function parse(string $xml): array
    {
        $nodes = CafXmlParser::toNodes($xml);

        $fa = trim($nodes['FA'] ?? '');
        if ($fa === '') {
            throw new InvalidArgumentException('El CAF no contiene la fecha de autorización (FA).');
        }

        $from = (int) $nodes['RNG']['D'];
        $to = (int) $nodes['RNG']['H'];

        if ($from < 1 || $to < $from) {
            throw new InvalidArgumentException('El rango de folios del CAF es inválido.');
        }

        return [
            'RE' => $nodes['RE'],
            'RS' => $nodes['RS'],
            'TD' => $nodes['TD'],
            'folio_from' => $from,
            'folio_to' => $to,
            'authorized_on' => $fa,
        ];
    }
}
