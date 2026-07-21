<?php

namespace App\Support\Validation;

use App\Enums\Medic\VaccinationScheduleType;
use App\Models\Store\ProductType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

final class VaccinationProtocolPayloadValidationRules
{
    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function storeRules(string $companyId): array
    {
        return [
            ...self::baseRules($companyId),
            'name' => [
                'required',
                'string',
                'max:255',
                ...self::uniqueNameRules($companyId),
            ],
        ];
    }

    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function updateRules(string $companyId, string $protocolId): array
    {
        return [
            ...self::baseRules($companyId),
            'name' => [
                'required',
                'string',
                'max:255',
                ...self::uniqueNameRules($companyId, $protocolId),
            ],
        ];
    }

    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    private static function baseRules(string $companyId): array
    {
        return [
            'species_id' => [
                'required',
                'uuid',
                Rule::exists('medic_species', 'id')->where(function ($query) use ($companyId): void {
                    $query->where('is_active', true)
                        ->where(function ($inner) use ($companyId): void {
                            $inner->where('company_id', $companyId)
                                ->orWhere(function ($global): void {
                                    $global->where('is_global', true)->whereNull('company_id');
                                });
                        });
                }),
            ],
            'description' => ['nullable', 'string', 'max:5000'],
            'version' => ['required', 'integer', 'min:1', 'max:65535'],
            'is_active' => ['required', 'boolean'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => [
                'required',
                'uuid',
                Rule::exists('store_products', 'id')->where(function ($query) use ($companyId): void {
                    $query->where('company_id', $companyId)
                        ->where('is_active', true)
                        ->whereIn('product_type_id', function ($sub): void {
                            $sub->select('id')
                                ->from('store_product_types')
                                ->whereNull('company_id')
                                ->where('name', ProductType::GLOBAL_VACCINES_NAME);
                        });
                }),
            ],
            'items.*.schedule_type' => ['required', Rule::enum(VaccinationScheduleType::class)],
            'items.*.week_number' => ['nullable', 'integer', 'min:0', 'max:520'],
            'items.*.min_age_weeks' => ['nullable', 'integer', 'min:0', 'max:520'],
            'items.*.max_age_weeks' => ['nullable', 'integer', 'min:0', 'max:520'],
            'items.*.interval_months' => ['nullable', 'integer', 'min:1', 'max:120'],
            'items.*.series_key' => ['nullable', 'string', 'max:64'],
        ];
    }

    /**
     * @return list<ValidationRule>
     */
    private static function uniqueNameRules(string $companyId, ?string $ignoreId = null): array
    {
        $unique = Rule::unique('medic_vaccination_protocols', 'name')
            ->where(fn ($query) => $query->where('company_id', $companyId));

        if ($ignoreId !== null) {
            $unique->ignore($ignoreId);
        }

        return [$unique];
    }

    public static function afterValidation(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            /** @var array<int, array<string, mixed>>|null $items */
            $items = $validator->getData()['items'] ?? null;

            if (! is_array($items)) {
                return;
            }

            foreach ($items as $index => $item) {
                if (! is_array($item)) {
                    continue;
                }

                $type = $item['schedule_type'] ?? null;

                if ($type === VaccinationScheduleType::FromBirthWeeks->value
                    && ($item['week_number'] === null || $item['week_number'] === '')) {
                    $validator->errors()->add(
                        "items.{$index}.week_number",
                        'Indica la semana desde el nacimiento.',
                    );
                }

                if ($type === VaccinationScheduleType::Unique->value) {
                    if ($item['min_age_weeks'] === null || $item['min_age_weeks'] === '') {
                        $validator->errors()->add(
                            "items.{$index}.min_age_weeks",
                            'Indica la edad mínima en semanas.',
                        );
                    }

                    if ($item['max_age_weeks'] === null || $item['max_age_weeks'] === '') {
                        $validator->errors()->add(
                            "items.{$index}.max_age_weeks",
                            'Indica la edad máxima en semanas.',
                        );
                    }

                    if (
                        $item['min_age_weeks'] !== null
                        && $item['min_age_weeks'] !== ''
                        && $item['max_age_weeks'] !== null
                        && $item['max_age_weeks'] !== ''
                        && (int) $item['max_age_weeks'] < (int) $item['min_age_weeks']
                    ) {
                        $validator->errors()->add(
                            "items.{$index}.max_age_weeks",
                            'La edad máxima debe ser mayor o igual a la mínima.',
                        );
                    }
                }

                if ($type === VaccinationScheduleType::Periodic->value
                    && ($item['interval_months'] === null || $item['interval_months'] === '')) {
                    $validator->errors()->add(
                        "items.{$index}.interval_months",
                        'Indica el intervalo en meses.',
                    );
                }
            }
        });
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array{
     *     company_id: string,
     *     species_id: string,
     *     name: string,
     *     description: string|null,
     *     version: int,
     *     is_active: bool,
     *     items: list<array{
     *         product_id: string,
     *         schedule_type: string,
     *         week_number: int|null,
     *         min_age_weeks: int|null,
     *         max_age_weeks: int|null,
     *         interval_months: int|null,
     *         series_key: string|null,
     *         sort_order: int
     *     }>
     * }
     */
    public static function storePayload(string $companyId, array $validated): array
    {
        return [
            'company_id' => $companyId,
            ...self::sharedPayload($validated),
        ];
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array{
     *     species_id: string,
     *     name: string,
     *     description: string|null,
     *     version: int,
     *     is_active: bool,
     *     items: list<array{
     *         product_id: string,
     *         schedule_type: string,
     *         week_number: int|null,
     *         min_age_weeks: int|null,
     *         max_age_weeks: int|null,
     *         interval_months: int|null,
     *         series_key: string|null,
     *         sort_order: int
     *     }>
     * }
     */
    public static function updatePayload(array $validated): array
    {
        return self::sharedPayload($validated);
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array{
     *     species_id: string,
     *     name: string,
     *     description: string|null,
     *     version: int,
     *     is_active: bool,
     *     items: list<array{
     *         product_id: string,
     *         schedule_type: string,
     *         week_number: int|null,
     *         min_age_weeks: int|null,
     *         max_age_weeks: int|null,
     *         interval_months: int|null,
     *         series_key: string|null,
     *         sort_order: int
     *     }>
     * }
     */
    private static function sharedPayload(array $validated): array
    {
        /** @var list<array<string, mixed>> $rawItems */
        $rawItems = array_values($validated['items'] ?? []);

        $items = [];
        foreach ($rawItems as $index => $item) {
            $type = (string) $item['schedule_type'];
            $items[] = [
                'product_id' => (string) $item['product_id'],
                'schedule_type' => $type,
                'week_number' => $type === VaccinationScheduleType::FromBirthWeeks->value
                    ? (int) $item['week_number']
                    : null,
                'min_age_weeks' => $type === VaccinationScheduleType::Unique->value
                    ? (int) $item['min_age_weeks']
                    : null,
                'max_age_weeks' => $type === VaccinationScheduleType::Unique->value
                    ? (int) $item['max_age_weeks']
                    : null,
                'interval_months' => $type === VaccinationScheduleType::Periodic->value
                    ? (int) $item['interval_months']
                    : null,
                'series_key' => $type !== VaccinationScheduleType::Unique->value
                    && isset($item['series_key'])
                    && is_string($item['series_key'])
                    && $item['series_key'] !== ''
                        ? $item['series_key']
                        : null,
                'sort_order' => $index,
            ];
        }

        return [
            'species_id' => (string) $validated['species_id'],
            'name' => (string) $validated['name'],
            'description' => isset($validated['description']) && is_string($validated['description']) && $validated['description'] !== ''
                ? $validated['description']
                : null,
            'version' => (int) $validated['version'],
            'is_active' => filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN),
            'items' => $items,
        ];
    }
}
