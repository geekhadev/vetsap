<?php

namespace App\Actions\Medic\DocumentTemplates;

use App\Models\Medic\DocumentTemplate;

final class CreateDocumentTemplateAction
{
    /**
     * @param  array{company_id: string, title: string, content: string}  $data
     */
    public function execute(array $data): DocumentTemplate
    {
        return DocumentTemplate::query()->create($data);
    }
}
