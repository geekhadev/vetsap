<?php

namespace App\Actions\Medic\DocumentTemplates;

use App\Models\Medic\DocumentTemplate;

final class UpdateDocumentTemplateAction
{
    /**
     * @param  array{title: string, content: string}  $data
     */
    public function execute(DocumentTemplate $documentTemplate, array $data): DocumentTemplate
    {
        $documentTemplate->update($data);

        return $documentTemplate;
    }
}
