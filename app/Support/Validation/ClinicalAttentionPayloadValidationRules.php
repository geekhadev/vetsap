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
            ...self::requestedServiceIdsRules($companyId),
            ...self::documentTemplateIdsRules($companyId),
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
            ...self::requestedServiceIdsRules($companyId),
            ...self::documentTemplateIdsRules($companyId),
        ];
    }

    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function requestedServiceIdsRules(string $companyId): array
    {
        return [
            'requested_service_ids' => ['nullable', 'array'],
            'requested_service_ids.*' => [
                'uuid',
                Rule::exists('medic_services', 'id')
                    ->where('company_id', $companyId)
                    ->where('is_active', true),
            ],
        ];
    }

    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function documentTemplateIdsRules(string $companyId): array
    {
        return [
            'document_template_ids' => ['nullable', 'array'],
            'document_template_ids.*' => [
                'uuid',
                Rule::exists('medic_document_templates', 'id')
                    ->where('company_id', $companyId),
            ],
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
            'requested_service_ids' => self::normalizedRequestedServiceIds($validated),
            'document_template_ids' => self::normalizedDocumentTemplateIds($validated),
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
            'requested_service_ids' => self::normalizedRequestedServiceIds($validated),
            'document_template_ids' => self::normalizedDocumentTemplateIds($validated),
        ];
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return list<string>
     */
    public static function normalizedRequestedServiceIds(array $validated): array
    {
        return self::normalizedUuidList($validated['requested_service_ids'] ?? []);
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return list<string>
     */
    public static function normalizedDocumentTemplateIds(array $validated): array
    {
        return self::normalizedUuidList($validated['document_template_ids'] ?? []);
    }

    /**
     * @return list<string>
     */
    public static function normalizedUuidList(mixed $ids): array
    {
        if (! is_array($ids)) {
            return [];
        }

        return array_values(array_unique(array_map(
            static fn (mixed $id): string => (string) $id,
            array_filter($ids, static fn (mixed $id): bool => is_string($id) || is_int($id)),
        )));
    }
}
