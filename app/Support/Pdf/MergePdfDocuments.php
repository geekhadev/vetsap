<?php

namespace App\Support\Pdf;

use setasign\Fpdi\Fpdi;
use setasign\Fpdi\PdfParser\StreamReader;

final class MergePdfDocuments
{
    /**
     * @param  list<string>  $pdfContents  Raw PDF binary strings
     */
    public function merge(array $pdfContents): string
    {
        $pdf = new Fpdi;

        foreach ($pdfContents as $content) {
            if ($content === '') {
                continue;
            }

            $pageCount = $pdf->setSourceFile(StreamReader::createByString($content));

            for ($page = 1; $page <= $pageCount; $page++) {
                $templateId = $pdf->importPage($page);
                $size = $pdf->getTemplateSize($templateId);
                $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
                $pdf->useTemplate($templateId);
            }
        }

        return $pdf->Output('S');
    }
}
