<?php

namespace App\Support\Validation;

use App\Enums\Medic\ClinicalAttentionStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

final class ClinicalAttentionPayloadValidationRules
{
    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function storeRules(string $companyId): array
    {
        return [
            'appointment_id' => ['nullable', 'uuid', Rule::exists('agenda_appointments', 'id')->where('company_id', $companyId)],
            'template_id' => ['required', 'uuid', Rule::exists('medic_clinical_templates', 'id')->where('company_id', $companyId)->where('is_active', true)],
            'patient_id' => ['required', 'uuid', Rule::exists('medic_patients', 'id')->where('company_id', $companyId)],
            'doctor_id' => ['required', 'uuid', Rule::exists('medic_doctors', 'id')->where('company_id', $companyId)],
            'values' => ['nullable', 'array'],
            'values.*' => ['nullable', 'string', 'max:5000'],
        ];
    }

    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function updateRules(string $companyId): array
    {
        return self::storeRules($companyId);
    }

    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function draftAutosaveRules(string $companyId): array
    {
        return [
            'appointment_id' => ['nullable', 'uuid', Rule::exists('agenda_appointments', 'id')->where('company_id', $companyId)],
            'template_id' => ['nullable', 'uuid', Rule::exists('medic_clinical_templates', 'id')->where('company_id', $companyId)->where('is_active', true)],
            'doctor_id' => ['nullable', 'uuid', Rule::exists('medic_doctors', 'id')->where('company_id', $companyId)],
            'values' => ['nullable', 'array'],
            'values.*' => ['nullable', 'string', 'max:5000'],
        ];
    }

    /**
     * @param  array<string, mixed>  $input
     * @return array<string, mixed>
     */
    public static function mergeNormalizedNullableFields(array $input): array
    {
        $value = $input['appointment_id'] ?? null;
        $input['appointment_id'] = ($value === null || $value === '') ? null : $value;

        return $input;
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array{
     *     company_id: string,
     *     appointment_id: string|null,
     *     template_id: string,
     *     patient_id: string,
     *     doctor_id: string,
     *     created_by_user_id: string|null,
     *     updated_by_user_id: string|null,
     *     values: array<string, mixed>,
     *     status: ClinicalAttentionStatus
     * }
     */
    public static function storePayload(string $companyId, array $validated, ?string $userId): array
    {
        return [
            'company_id' => $companyId,
            'appointment_id' => $validated['appointment_id'] ?? null,
            'template_id' => (string) $validated['template_id'],
            'patient_id' => (string) $validated['patient_id'],
            'doctor_id' => (string) $validated['doctor_id'],
            'created_by_user_id' => $userId,
            'updated_by_user_id' => $userId,
            'values' => $validated['values'] ?? [],
            'status' => ClinicalAttentionStatus::Closed,
        ];
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array{
     *     appointment_id: string|null,
     *     template_id: string|null,
     *     doctor_id: string|null,
     *     values: array<string, mixed>
     * }
     */
    public static function draftAutosavePayload(array $validated): array
    {
        $doctorId = $validated['doctor_id'] ?? null;

        return [
            'appointment_id' => $validated['appointment_id'] ?? null,
            'template_id' => isset($validated['template_id']) ? (string) $validated['template_id'] : null,
            'doctor_id' => ($doctorId === null || $doctorId === '') ? null : (string) $doctorId,
            'values' => $validated['values'] ?? [],
        ];
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array{
     *     appointment_id: string|null,
     *     template_id: string,
     *     patient_id: string,
     *     doctor_id: string,
     *     updated_by_user_id: string|null,
     *     values: array<string, mixed>
     * }
     */
    public static function updatePayload(array $validated, ?string $userId): array
    {
        return [
            'appointment_id' => $validated['appointment_id'] ?? null,
            'template_id' => (string) $validated['template_id'],
            'patient_id' => (string) $validated['patient_id'],
            'doctor_id' => (string) $validated['doctor_id'],
            'updated_by_user_id' => $userId,
            'values' => $validated['values'] ?? [],
        ];
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array{
     *     appointment_id: string|null,
     *     template_id: string,
     *     patient_id: string,
     *     doctor_id: string,
     *     updated_by_user_id: string|null,
     *     values: array<string, mixed>
     * }
     */
    public static function closeDraftPayload(string $patientId, array $validated, ?string $userId): array
    {
        return [
            'appointment_id' => $validated['appointment_id'] ?? null,
            'template_id' => (string) $validated['template_id'],
            'patient_id' => $patientId,
            'doctor_id' => (string) $validated['doctor_id'],
            'updated_by_user_id' => $userId,
            'values' => $validated['values'] ?? [],
        ];
    }
}
