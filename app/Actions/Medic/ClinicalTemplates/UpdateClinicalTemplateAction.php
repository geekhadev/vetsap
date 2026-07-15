<?php

namespace App\Actions\Medic\ClinicalTemplates;

use App\Models\Medic\ClinicalTemplate;
use Illuminate\Support\Facades\DB;

final class UpdateClinicalTemplateAction
{
    /**
     * @param  array{
     *     species_ids: list<string>,
     *     name: string,
     *     description: string|null,
     *     is_default: bool,
     *     is_active: bool,
     *     fields: array<int, array{field_key: string, label: string, field_order: int, is_required: bool}>
     * }  $data
     */
    public function execute(ClinicalTemplate $template, array $data): ClinicalTemplate
    {
        return DB::transaction(function () use ($template, $data): ClinicalTemplate {
            $fields = $data['fields'] ?? [];
            $speciesIds = $data['species_ids'] ?? [];
            unset($data['fields'], $data['species_ids']);

            if ($data['is_default']) {
                ClinicalTemplate::clearOtherDefaults($template->company_id, $template->id);
            }

            $template->update($data);

            $template->species()->sync($speciesIds);

            $template->fields()->delete();
            foreach ($fields as $field) {
                $template->fields()->create($field);
            }

            return $template->refresh()->load(['fields', 'species:id,name']);
        });
    }
}
