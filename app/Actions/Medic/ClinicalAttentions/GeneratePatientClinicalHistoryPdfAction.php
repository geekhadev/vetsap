<?php

namespace App\Actions\Medic\ClinicalAttentions;

use App\Enums\Medic\ClinicalAttentionStatus;
use App\Models\Medic\ClinicalAttention;
use App\Models\Medic\Patient;
use App\Support\Pdf\MergePdfDocuments;
use App\Support\Pdf\StampPdfPageFooters;
use Illuminate\Support\Str;
use RuntimeException;

final class GeneratePatientClinicalHistoryPdfAction
{
    public function __construct(
        private readonly GenerateClinicalAttentionPdfAction $generateAttentionPdf,
        private readonly MergePdfDocuments $mergePdfDocuments,
        private readonly StampPdfPageFooters $stampPdfPageFooters,
    ) {}

    /**
     * @return array{content: string, filename: string}
     */
    public function execute(Patient $patient): array
    {
        $attentions = ClinicalAttention::query()
            ->where('patient_id', $patient->id)
            ->where('company_id', $patient->company_id)
            ->where('status', ClinicalAttentionStatus::Closed)
            ->orderBy('closed_at')
            ->orderBy('started_at')
            ->orderBy('created_at')
            ->get();

        if ($attentions->isEmpty()) {
            throw new RuntimeException('El paciente no tiene atenciones cerradas para generar el historial.');
        }

        $parts = [];
        $segments = [];

        foreach ($attentions as $attention) {
            $content = $this->generateAttentionPdf->buildContent($attention);
            $pageCount = $this->stampPdfPageFooters->pageCount($content);

            if ($pageCount < 1) {
                continue;
            }

            $parts[] = $content;
            $segments[] = [
                'pages' => $pageCount,
                'text' => $this->generateAttentionPdf->footerText($attention),
            ];
        }

        if ($parts === []) {
            throw new RuntimeException('No se pudo generar el historial PDF del paciente.');
        }

        $merged = count($parts) === 1
            ? $parts[0]
            : $this->mergePdfDocuments->merge($parts);

        return [
            'content' => $this->stampPdfPageFooters->stamp($merged, $segments),
            'filename' => $this->filename($patient),
        ];
    }

    private function filename(Patient $patient): string
    {
        $patientSlug = Str::slug($patient->name !== '' ? $patient->name : 'paciente');

        return "historial-{$patientSlug}-".now()->timezone(config('app.timezone'))->format('Y-m-d').'.pdf';
    }
}
