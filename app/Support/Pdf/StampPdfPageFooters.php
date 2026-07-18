<?php

namespace App\Support\Pdf;

use setasign\Fpdi\Fpdi;
use setasign\Fpdi\PdfParser\StreamReader;
use Throwable;

final class StampPdfPageFooters
{
    /**
     * @param  list<array{pages: int, text: string}>  $segments
     */
    public function stamp(string $pdfContent, array $segments): string
    {
        if ($pdfContent === '' || $segments === []) {
            return $pdfContent;
        }

        try {
            $pdf = new Fpdi;
            $totalPages = $pdf->setSourceFile(StreamReader::createByString($pdfContent));
            $footerByPage = $this->expandSegments($segments, $totalPages);

            for ($page = 1; $page <= $totalPages; $page++) {
                $templateId = $pdf->importPage($page);
                $size = $pdf->getTemplateSize($templateId);
                $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
                $pdf->useTemplate($templateId);
                $pdf->SetAutoPageBreak(false);

                $this->drawFooter(
                    $pdf,
                    $size['width'],
                    $size['height'],
                    $footerByPage[$page] ?? '',
                    $page,
                    $totalPages,
                );
            }

            return $pdf->Output('S');
        } catch (Throwable) {
            return $pdfContent;
        }
    }

    public function stampUniform(string $pdfContent, string $footerText): string
    {
        try {
            $pdf = new Fpdi;
            $totalPages = $pdf->setSourceFile(StreamReader::createByString($pdfContent));
        } catch (Throwable) {
            return $pdfContent;
        }

        if ($totalPages < 1) {
            return $pdfContent;
        }

        return $this->stamp($pdfContent, [
            ['pages' => $totalPages, 'text' => $footerText],
        ]);
    }

    public function pageCount(string $pdfContent): int
    {
        try {
            $pdf = new Fpdi;

            return $pdf->setSourceFile(StreamReader::createByString($pdfContent));
        } catch (Throwable) {
            return 0;
        }
    }

    /**
     * @param  list<array{pages: int, text: string}>  $segments
     * @return array<int, string>
     */
    private function expandSegments(array $segments, int $totalPages): array
    {
        $map = [];
        $page = 1;

        foreach ($segments as $segment) {
            $count = max(0, $segment['pages']);

            for ($i = 0; $i < $count && $page <= $totalPages; $i++) {
                $map[$page] = $segment['text'];
                $page++;
            }
        }

        while ($page <= $totalPages) {
            $map[$page] = $map[$page - 1] ?? '';
            $page++;
        }

        return $map;
    }

    private function drawFooter(
        Fpdi $pdf,
        float $pageWidth,
        float $pageHeight,
        string $text,
        int $page,
        int $totalPages,
    ): void {
        $bandHeight = 11.0;
        $marginX = 10.0;
        $topY = $pageHeight - $bandHeight;

        $pdf->SetFillColor(255, 255, 255);
        $pdf->Rect(0, $topY, $pageWidth, $bandHeight, 'F');

        $pdf->SetDrawColor(231, 229, 228);
        $pdf->SetLineWidth(0.2);
        $pdf->Line($marginX, $topY + 1.5, $pageWidth - $marginX, $topY + 1.5);

        $pdf->SetFont('Helvetica', '', 7);
        $pdf->SetTextColor(120, 113, 108);

        $pageLabel = $this->encode("Página {$page} de {$totalPages}");
        $pageLabelWidth = 28.0;
        $textWidth = max(20.0, $pageWidth - ($marginX * 2) - $pageLabelWidth - 4);

        $pdf->SetXY($marginX, $topY + 3.5);
        $pdf->Cell($textWidth, 4, $this->encode($this->truncate($text, 90)), 0, 0, 'L');

        $pdf->SetXY($pageWidth - $marginX - $pageLabelWidth, $topY + 3.5);
        $pdf->Cell($pageLabelWidth, 4, $pageLabel, 0, 0, 'R');
    }

    private function truncate(string $text, int $maxChars): string
    {
        if (mb_strlen($text) <= $maxChars) {
            return $text;
        }

        return rtrim(mb_substr($text, 0, $maxChars - 1)).'…';
    }

    private function encode(string $text): string
    {
        $encoded = @iconv('UTF-8', 'ISO-8859-1//TRANSLIT', $text);

        return $encoded === false ? $text : $encoded;
    }
}
