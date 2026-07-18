<?php

namespace App\Actions\Medic\ClinicalTemplates;

use App\Models\Medic\ClinicalTemplate;
use Illuminate\Support\Facades\DB;

final class CreateClinicalTemplateAction
{
    /**
     * @param  array{
     *     company_id: string,
     *     species_ids: list<string>,
     *     name: string,
     *     description: string|null,
     *     is_default: bool,
     *     is_active: bool,
     *     fields: array<int, array{field_key: string, label: string, field_order: int, is_required: bool, is_shared_with_client: bool}>
     * }  $data
     */
    public function execute(array $data): ClinicalTemplate
    {
        return DB::transaction(function () use ($data): ClinicalTemplate {
            $fields = $data['fields'] ?? [];
            $speciesIds = $data['species_ids'] ?? [];
            unset($data['fields'], $data['species_ids']);

            if ($data['is_default']) {
                ClinicalTemplate::clearOtherDefaults($data['company_id']);
            }

            /** @var ClinicalTemplate $template */
            $template = ClinicalTemplate::query()->create($data);

            $template->species()->sync($speciesIds);

            foreach ($fields as $field) {
                $template->fields()->create($field);
            }

            return $template->load(['fields', 'species:id,name']);
        });
    }
}
