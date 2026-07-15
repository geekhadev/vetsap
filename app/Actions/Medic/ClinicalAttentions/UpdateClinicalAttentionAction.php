<?php

namespace App\Actions\Medic\ClinicalAttentions;

use App\Models\Medic\ClinicalAttention;
use Illuminate\Support\Facades\DB;

final class UpdateClinicalAttentionAction
{
    /**
     * @param  array{
     *     appointment_id: string|null,
     *     template_id: string,
     *     patient_id: string,
     *     doctor_id: string,
     *     updated_by_user_id: string|null,
     *     values: array<string, mixed>
     * }  $data
     */
    public function execute(ClinicalAttention $attention, array $data): ClinicalAttention
    {
        return DB::transaction(function () use ($attention, $data): ClinicalAttention {
            $values = $data['values'] ?? [];
            unset($data['values']);

            $attention->update($data);

            $attention->values()->delete();
            foreach ($values as $fieldKey => $value) {
                if ($value === null || $value === '') {
                    continue;
                }

                $attention->values()->create([
                    'field_key' => $fieldKey,
                    'value' => $value,
                ]);
            }

            return $attention->refresh()->load(['patient:id,name,record_number', 'doctor:id,first_name,last_name', 'template:id,name', 'values']);
        });
    }
}
