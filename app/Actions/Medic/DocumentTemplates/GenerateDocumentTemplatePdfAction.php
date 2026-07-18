<?php

namespace App\Actions\Medic\DocumentTemplates;

use App\Models\Medic\ClinicalAttention;
use App\Models\Medic\DocumentTemplate;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Str;
use RuntimeException;

final class GenerateDocumentTemplatePdfAction
{
    public function __construct(
        private readonly ResolveDocumentTemplateContentAction $resolveContent,
    ) {}

    /**
     * @return array{content: string, filename: string}
     */
    public function execute(ClinicalAttention $attention, DocumentTemplate $template): array
    {
        if ((string) $attention->company_id !== (string) $template->company_id) {
            throw new RuntimeException('La plantilla no pertenece a la empresa de la atención.');
        }

        $isLinked = $attention->documentTemplates()
            ->whereKey($template->id)
            ->exists();

        if (! $isLinked) {
            throw new RuntimeException('La plantilla no está asociada a esta atención.');
        }

        $html = $this->resolveContent->execute($attention, $template);

        $content = Pdf::loadView('medic.document-templates.pdf', [
            'title' => $template->title,
            'content' => $html,
        ])
            ->setPaper('letter')
            ->output();

        $slug = Str::slug($template->title);
        if ($slug === '') {
            $slug = 'documento';
        }

        return [
            'content' => $content,
            'filename' => "{$slug}.pdf",
        ];
    }
}
