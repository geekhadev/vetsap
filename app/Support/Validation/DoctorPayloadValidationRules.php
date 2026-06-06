<?php

namespace App\Support\Validation;

use App\Enums\Medic\DoctorDocumentType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

final class DoctorPayloadValidationRules
{
    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function storeRules(string $companyId): array
    {
        $documentType = request()->input('document_type');

        return [
            ...self::sharedFieldRules(),
            'document_type' => ['required', Rule::enum(DoctorDocumentType::class)],
            'document_number' => [
                'required',
                'string',
                'max:20',
                Rule::unique('medic_doctors', 'document_number')
                    ->where(fn ($query) => $query
                        ->where('company_id', $companyId)
                        ->where('document_type', $documentType)),
            ],
            'is_active' => ['required', 'boolean'],
            'use_web' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function updateRules(string $companyId): array
    {
        return [
            ...self::sharedFieldRules(),
            'document_type' => ['prohibited'],
            'document_number' => ['prohibited'],
            'is_active' => ['required', 'boolean'],
            'use_web' => ['required', 'boolean'],
            'services' => ['sometimes', 'array'],
            'services.*.service_id' => [
                'required',
                'uuid',
                'distinct',
                Rule::exists('medic_services', 'id')->where('company_id', $companyId),
            ],
            'services.*.duration_override_minutes' => ['nullable', 'integer', 'min:1', 'max:1440'],
        ];
    }

    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function syncServicesRules(string $companyId): array
    {
        return [
            'services' => ['required', 'array'],
            'services.*.service_id' => [
                'required',
                'uuid',
                'distinct',
                Rule::exists('medic_services', 'id')->where('company_id', $companyId),
            ],
            'services.*.duration_override_minutes' => ['nullable', 'integer', 'min:1', 'max:1440'],
        ];
    }

    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    private static function sharedFieldRules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
        ];
    }

    /**
     * @param  array<string, mixed>  $input
     * @return array<string, mixed>
     */
    public static function mergeNormalizedNullableFields(array $input): array
    {
        $nullable = ['phone', 'email'];
        $merged = $input;

        foreach ($nullable as $field) {
            $value = $merged[$field] ?? null;
            $merged[$field] = ($value === null || $value === '') ? null : $value;
        }

        return $merged;
    }

    /**
     * @return array{
     *     company_id: string,
     *     document_type: DoctorDocumentType,
     *     document_number: string,
     *     first_name: string,
     *     last_name: string,
     *     phone: string|null,
     *     email: string|null,
     *     is_active: bool,
     *     use_web: bool
     * }
     */
    public static function storePayload(string $companyId, array $validated): array
    {
        $documentType = $validated['document_type'];

        return [
            'company_id' => $companyId,
            ...self::sharedPayload($validated),
            'document_type' => $documentType instanceof DoctorDocumentType
                ? $documentType
                : DoctorDocumentType::from((string) $documentType),
            'document_number' => (string) $validated['document_number'],
            'is_active' => filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN),
            'use_web' => filter_var($validated['use_web'], FILTER_VALIDATE_BOOLEAN),
        ];
    }

    /**
     * @return array{
     *     first_name: string,
     *     last_name: string,
     *     phone: string|null,
     *     email: string|null,
     *     is_active: bool,
     *     use_web: bool
     * }
     */
    public static function updatePayload(array $validated): array
    {
        return [
            ...self::sharedPayload($validated),
            'is_active' => filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN),
            'use_web' => filter_var($validated['use_web'], FILTER_VALIDATE_BOOLEAN),
        ];
    }

    /**
     * @return list<array{service_id: string, duration_override_minutes: int|null}>
     */
    public static function servicesPayload(array $validated): array
    {
        if (! array_key_exists('services', $validated) || ! is_array($validated['services'])) {
            return [];
        }

        $rows = [];

        foreach ($validated['services'] as $row) {
            if (! is_array($row) || ! isset($row['service_id'])) {
                continue;
            }

            $override = $row['duration_override_minutes'] ?? null;
            $rows[] = [
                'service_id' => (string) $row['service_id'],
                'duration_override_minutes' => ($override === null || $override === '')
                    ? null
                    : (int) $override,
            ];
        }

        return $rows;
    }

    /**
     * @return array{
     *     first_name: string,
     *     last_name: string,
     *     phone: string|null,
     *     email: string|null
     * }
     */
    private static function sharedPayload(array $validated): array
    {
        return [
            'first_name' => (string) $validated['first_name'],
            'last_name' => (string) $validated['last_name'],
            'phone' => $validated['phone'] ?? null,
            'email' => $validated['email'] ?? null,
        ];
    }
}
