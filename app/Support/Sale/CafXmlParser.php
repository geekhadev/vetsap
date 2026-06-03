<?php

namespace App\Support\Sale;

use DOMDocument;
use DOMXPath;
use InvalidArgumentException;

final class CafXmlParser
{
    /**
     * @return array{
     *     RE: string,
     *     RS: string,
     *     TD: string,
     *     RNG: array{D: string, H: string},
     *     FA: string,
     *     nodes: array<string, string>
     * }
     */
    public static function toNodes(string $xml): array
    {
        $xmlUtf8 = self::toUtf8($xml);

        $dom = new DOMDocument;
        $previous = libxml_use_internal_errors(true);
        $loaded = $dom->loadXML($xmlUtf8);
        $errors = libxml_get_errors();
        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        if (! $loaded) {
            $message = $errors !== [] ? trim($errors[0]->message) : 'XML inválido.';

            throw new InvalidArgumentException($message);
        }

        $xpath = new DOMXPath($dom);
        $re = self::firstNodeText($xpath, '//RE');
        $rs = self::firstNodeText($xpath, '//RS');
        $td = self::firstNodeText($xpath, '//TD');
        $d = self::firstNodeText($xpath, '//RNG/D');
        $h = self::firstNodeText($xpath, '//RNG/H');
        $fa = self::firstNodeText($xpath, '//FA');

        if ($re === '' || $td === '' || $d === '' || $h === '') {
            throw new InvalidArgumentException('El CAF no contiene los nodos RE, TD o RNG requeridos.');
        }

        $nodes = [
            'RE' => $re,
            'RS' => $rs,
            'TD' => $td,
            'RNG_D' => $d,
            'RNG_H' => $h,
            'FA' => $fa,
        ];

        return [
            'RE' => $re,
            'RS' => $rs,
            'TD' => $td,
            'RNG' => [
                'D' => $d,
                'H' => $h,
            ],
            'FA' => $fa,
            'nodes' => $nodes,
        ];
    }

    private static function toUtf8(string $xml): string
    {
        if (mb_detect_encoding($xml, ['UTF-8'], true) === 'UTF-8') {
            return $xml;
        }

        $fromIso = @iconv('ISO-8859-1', 'UTF-8//IGNORE', $xml);

        if (is_string($fromIso) && $fromIso !== '') {
            return $fromIso;
        }

        $fromGb = @iconv('GB18030', 'UTF-8//IGNORE', $xml);

        return is_string($fromGb) && $fromGb !== '' ? $fromGb : $xml;
    }

    private static function firstNodeText(DOMXPath $xpath, string $expression): string
    {
        $list = @$xpath->query($expression);

        if ($list === false || $list->length === 0) {
            return '';
        }

        return trim($list->item(0)?->textContent ?? '');
    }
}
