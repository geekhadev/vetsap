<?php

namespace App\Support\Validation;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

final class ClinicalTemplatePayloadValidationRules
{
    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function storeRules(string $companyId): array
    {
        return [
            'species_ids' => ['nullable', 'array'],
            'species_ids.*' => ['uuid', Rule::exists('medic_species', 'id')->where('company_id', $companyId)],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_default' => ['boolean'],
            'is_active' => ['boolean'],
            ...self::fieldsRules(),
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
    private static function fieldsRules(): array
    {
        return [
            'fields' => ['nullable', 'array'],
            'fields.*.field_key' => ['required', 'string', 'max:64'],
            'fields.*.label' => ['required', 'string', 'max:255'],
            'fields.*.is_required' => ['boolean'],
        ];
    }

    /**
     * @param  array<string, mixed>  $input
     * @return array<string, mixed>
     */
    public static function mergeNormalizedNullableFields(array $input): array
    {
        $description = $input['description'] ?? null;
        $input['description'] = ($description === null || $description === '') ? null : $description;

        $speciesIds = $input['species_ids'] ?? [];
        if (! is_array($speciesIds)) {
            $speciesIds = $speciesIds === null || $speciesIds === '' ? [] : [$speciesIds];
        }

        $input['species_ids'] = array_values(array_unique(array_filter(
            array_map(static fn (mixed $id): string => (string) $id, $speciesIds),
            static fn (string $id): bool => $id !== '',
        )));

        return $input;
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array{
     *     company_id: string,
     *     species_ids: list<string>,
     *     name: string,
     *     description: string|null,
     *     is_default: bool,
     *     is_active: bool,
     *     fields: array<int, array{field_key: string, label: string, field_order: int, is_required: bool}>
     * }
     */
    public static function payload(string $companyId, array $validated): array
    {
        $rawFields = $validated['fields'] ?? [];

        $fields = array_values(array_map(fn (array $f, int $i) => [
            'field_key' => (string) $f['field_key'],
            'label' => (string) $f['label'],
            'field_order' => $i,
            'is_required' => (bool) ($f['is_required'] ?? false),
        ], $rawFields, array_keys($rawFields)));

        /** @var list<string> $speciesIds */
        $speciesIds = array_values(array_unique(array_map(
            static fn (mixed $id): string => (string) $id,
            $validated['species_ids'] ?? [],
        )));

        return [
            'company_id' => $companyId,
            'species_ids' => $speciesIds,
            'name' => (string) $validated['name'],
            'description' => $validated['description'] ?? null,
            'is_default' => (bool) ($validated['is_default'] ?? false),
            'is_active' => (bool) ($validated['is_active'] ?? true),
            'fields' => $fields,
        ];
    }
}
