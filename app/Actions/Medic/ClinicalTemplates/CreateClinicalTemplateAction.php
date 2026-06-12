<?php

namespace App\Actions\Medic\ClinicalTemplates;

use App\Models\Medic\ClinicalTemplate;
use Illuminate\Support\Facades\DB;

final class CreateClinicalTemplateAction
{
    /**
     * @param  array{
     *     company_id: string,
     *     species_id: string|null,
     *     name: string,
     *     description: string|null,
     *     is_default: bool,
     *     is_active: bool,
     *     fields: array<int, array{field_key: string, label: string, field_order: int, is_required: bool}>
     * }  $data
     */
    public function execute(array $data): ClinicalTemplate
    {
        return DB::transaction(function () use ($data): ClinicalTemplate {
            $fields = $data['fields'] ?? [];
            unset($data['fields']);

            if ($data['is_default']) {
                ClinicalTemplate::clearOtherDefaults($data['company_id']);
            }

            /** @var ClinicalTemplate $template */
            $template = ClinicalTemplate::query()->create($data);

            foreach ($fields as $field) {
                $template->fields()->create($field);
            }

            return $template->load('fields');
        });
    }
}
