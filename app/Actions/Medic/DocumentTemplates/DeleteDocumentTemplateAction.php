<?php

namespace App\Actions\Medic\DocumentTemplates;

use App\Models\Medic\DocumentTemplate;

final class DeleteDocumentTemplateAction
{
    public function execute(DocumentTemplate $documentTemplate): void
    {
        $documentTemplate->delete();
    }
}
