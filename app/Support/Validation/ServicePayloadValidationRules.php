<?php

namespace App\Support\Validation;

use App\Actions\Configuration\CalendarSettings\ResolveCalendarTimeBlockMinutesAction;
use App\Models\Company;
use App\Support\Configuration\CalendarSettingKeys;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

final class ServicePayloadValidationRules
{
    public const DURATION_MAX_BLOCKS = 6;

    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function storeRules(string $companyId, int $timeBlockMinutes): array
    {
        return [
            'specialty_id' => [
                'required',
                'uuid',
                Rule::exists('medic_specialties', 'id')->where(function ($query) use ($companyId): void {
                    $query->where('is_active', true)
                        ->where(function ($inner) use ($companyId): void {
                            $inner->where('company_id', $companyId)
                                ->orWhere(function ($global): void {
                                    $global->where('is_global', true)->whereNull('company_id');
                                });
                        });
                }),
            ],
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('medic_services', 'name')->where('company_id', $companyId),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'price' => ['nullable', 'numeric', 'min:0', 'max:999999999'],
            'duration_minutes' => self::durationMinutesRules($timeBlockMinutes),
            'is_active' => ['required', 'boolean'],
            'use_web' => ['required', 'boolean'],
            'is_default' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function updateRules(
        string $companyId,
        string $serviceId,
        int $timeBlockMinutes,
    ): array {
        return [
            'specialty_id' => [
                'required',
                'uuid',
                Rule::exists('medic_specialties', 'id')->where(function ($query) use ($companyId): void {
                    $query->where(function ($inner) use ($companyId): void {
                        $inner->where('company_id', $companyId)
                            ->orWhere(function ($global): void {
                                $global->where('is_global', true)->whereNull('company_id');
                            });
                    });
                }),
            ],
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('medic_services', 'name')
                    ->where('company_id', $companyId)
                    ->ignore($serviceId),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'price' => ['nullable', 'numeric', 'min:0', 'max:999999999'],
            'duration_minutes' => self::durationMinutesRules($timeBlockMinutes),
            'is_active' => ['required', 'boolean'],
            'use_web' => ['required', 'boolean'],
            'is_default' => ['required', 'boolean'],
        ];
    }

    /**
     * @return list<int>
     */
    public static function allowedDurationMinutes(int $timeBlockMinutes): array
    {
        $allowed = [];

        for ($blocks = 1; $blocks <= self::DURATION_MAX_BLOCKS; $blocks += 1) {
            $allowed[] = $blocks * max(1, $timeBlockMinutes);
        }

        return $allowed;
    }

    /**
     * @return array<int, ValidationRule|string>
     */
    private static function durationMinutesRules(int $timeBlockMinutes): array
    {
        return [
            'required',
            'integer',
            Rule::in(self::allowedDurationMinutes($timeBlockMinutes)),
        ];
    }

    public static function resolveTimeBlockMinutes(?Company $company): int
    {
        if (! $company instanceof Company) {
            return (int) CalendarSettingKeys::defaults()[CalendarSettingKeys::TIME_BLOCK_MINUTES];
        }

        return app(ResolveCalendarTimeBlockMinutesAction::class)->execute($company);
    }

    /**
     * @param  array<string, mixed>  $input
     * @return array<string, mixed>
     */
    public static function mergeNormalizedNullableFields(array $input): array
    {
        $nullable = ['description', 'price'];
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
     *     specialty_id: string,
     *     name: string,
     *     description: string|null,
     *     price: string|null,
     *     tax_treatment: string,
     *     duration_minutes: int,
     *     is_active: bool,
     *     use_web: bool,
     *     is_default: bool
     * }
     */
    public static function storePayload(string $companyId, array $validated): array
    {
        return [
            'company_id' => $companyId,
            'specialty_id' => (string) $validated['specialty_id'],
            'name' => (string) $validated['name'],
            'description' => $validated['description'] ?? null,
            'price' => self::normalizePrice($validated['price'] ?? null),
            'tax_treatment' => 'exempt',
            'duration_minutes' => self::normalizeDuration($validated['duration_minutes']),
            'is_active' => filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN),
            'use_web' => filter_var($validated['use_web'], FILTER_VALIDATE_BOOLEAN),
            'is_default' => filter_var($validated['is_default'] ?? false, FILTER_VALIDATE_BOOLEAN),
        ];
    }

    /**
     * @return array{
     *     specialty_id: string,
     *     name: string,
     *     description: string|null,
     *     price: string|null,
     *     tax_treatment: string,
     *     duration_minutes: int,
     *     is_active: bool,
     *     use_web: bool,
     *     is_default: bool
     * }
     */
    public static function updatePayload(array $validated): array
    {
        return [
            'specialty_id' => (string) $validated['specialty_id'],
            'name' => (string) $validated['name'],
            'description' => $validated['description'] ?? null,
            'price' => self::normalizePrice($validated['price'] ?? null),
            'tax_treatment' => 'exempt',
            'duration_minutes' => self::normalizeDuration($validated['duration_minutes']),
            'is_active' => filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN),
            'use_web' => filter_var($validated['use_web'], FILTER_VALIDATE_BOOLEAN),
            'is_default' => filter_var($validated['is_default'] ?? false, FILTER_VALIDATE_BOOLEAN),
        ];
    }

    private static function normalizePrice(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        return (string) (int) round((float) $value);
    }

    private static function normalizeDuration(mixed $value): int
    {
        return (int) $value;
    }
}
