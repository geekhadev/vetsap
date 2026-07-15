<?php

namespace App\Actions\Medic\ClinicalAttentions;

use App\Enums\Medic\ClinicalAttentionStatus;
use App\Models\Medic\ClinicalAttention;
use Illuminate\Support\Facades\DB;

final class CreateClinicalAttentionAction
{
    /**
     * @param  array{
     *     company_id: string,
     *     appointment_id: string|null,
     *     template_id: string,
     *     patient_id: string,
     *     doctor_id: string,
     *     created_by_user_id: string|null,
     *     updated_by_user_id: string|null,
     *     status: ClinicalAttentionStatus,
     *     values: array<string, mixed>
     * }  $data
     */
    public function execute(array $data): ClinicalAttention
    {
        return DB::transaction(function () use ($data): ClinicalAttention {
            $values = $data['values'] ?? [];
            unset($data['values'], $data['status']);

            /** @var ClinicalAttention $attention */
            $attention = ClinicalAttention::query()->create($data);

            foreach ($values as $fieldKey => $value) {
                if ($value === null || $value === '') {
                    continue;
                }

                $attention->values()->create([
                    'field_key' => $fieldKey,
                    'value' => $value,
                ]);
            }

            return $attention->load(['patient:id,name,record_number', 'doctor:id,first_name,last_name', 'template:id,name', 'values']);
        });
    }
}
