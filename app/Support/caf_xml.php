<?php

declare(strict_types=1);

use App\Support\Sale\CafXmlParser;

/**
 * Convierte el contenido XML de un CAF en nodos clave (estructura genérica).
 *
 * @return array{
 *     RE: string,
 *     RS: string,
 *     TD: string,
 *     RNG: array{D: string, H: string},
 *     FA: string,
 *     nodes: array<string, string>
 * }
 */
function caf_xml_to_nodes(string $xml): array
{
    return CafXmlParser::toNodes($xml);
}
