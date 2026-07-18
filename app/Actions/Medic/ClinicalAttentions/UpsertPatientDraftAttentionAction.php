<?php

namespace App\Actions\Medic\ClinicalAttentions;

use App\Enums\Medic\ClinicalAttentionStatus;
use App\Models\Medic\ClinicalAttention;
use App\Models\Medic\ClinicalTemplate;
use App\Models\Medic\Patient;
use Illuminate\Support\Facades\DB;

final class UpsertPatientDraftAttentionAction
{
    /**
     * @param  array{
     *     template_id?: string|null,
     *     doctor_id?: string|null,
     *     appointment_id?: string|null,
     *     values?: array<string, mixed>,
     *     requested_service_ids?: list<string>,
     *     document_template_ids?: list<string>
     * }  $data
     */
    public function execute(Patient $patient, string $companyId, array $data, ?string $userId): ClinicalAttention
    {
        return DB::transaction(function () use ($patient, $companyId, $data, $userId): ClinicalAttention {
            /** @var ClinicalAttention|null $draft */
            $draft = ClinicalAttention::query()
                ->where('patient_id', $patient->id)
                ->where('status', ClinicalAttentionStatus::Draft)
                ->lockForUpdate()
                ->first();

            $templateId = $data['template_id'] ?? null;

            if ($templateId === null || $templateId === '') {
                $templateId = ClinicalTemplate::query()
                    ->forCompany($companyId)
                    ->where('is_active', true)
                    ->orderByDesc('is_default')
                    ->orderBy('name')
                    ->value('id');
            }

            if ($templateId === null) {
                throw new \RuntimeException('No hay plantillas clínicas activas para registrar la atención.');
            }

            $values = $data['values'] ?? [];
            $doctorId = $data['doctor_id'] ?? null;
            $doctorId = ($doctorId === null || $doctorId === '') ? null : $doctorId;
            $requestedServiceIds = $data['requested_service_ids'] ?? [];
            $documentTemplateIds = $data['document_template_ids'] ?? [];

            $attributes = [
                'template_id' => $templateId,
                'doctor_id' => $doctorId,
                'updated_by_user_id' => $userId,
            ];

            if (array_key_exists('appointment_id', $data)) {
                $attributes['appointment_id'] = $data['appointment_id'];
            }

            if ($draft instanceof ClinicalAttention) {
                $draft->update($attributes);
            } else {
                /** @var ClinicalAttention $draft */
                $draft = ClinicalAttention::query()->create([
                    'company_id' => $companyId,
                    'patient_id' => $patient->id,
                    'status' => ClinicalAttentionStatus::Draft,
                    'started_at' => now(),
                    'closed_at' => null,
                    'created_by_user_id' => $userId,
                    ...$attributes,
                ]);
            }

            $draft->values()->delete();

            foreach ($values as $fieldKey => $value) {
                if ($value === null || $value === '') {
                    continue;
                }

                $draft->values()->create([
                    'field_key' => $fieldKey,
                    'value' => $value,
                ]);
            }

            $draft->requestedServices()->sync($requestedServiceIds);
            $draft->documentTemplates()->sync($documentTemplateIds);

            return $draft->refresh()->load([
                'values',
                'template.fields',
                'requestedServices:id,name',
                'documentTemplates:id,title',
            ]);
        });
    }
}
