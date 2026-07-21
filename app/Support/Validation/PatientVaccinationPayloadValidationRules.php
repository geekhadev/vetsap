<?php

namespace App\Support\Validation;

use App\Enums\Medic\VaccinationAdministeredOrigin;
use App\Models\Store\ProductType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

final class PatientVaccinationPayloadValidationRules
{
    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function assignRules(string $companyId, string $speciesId): array
    {
        return [
            'protocol_id' => [
                'required',
                'uuid',
                Rule::exists('medic_vaccination_protocols', 'id')->where(function ($query) use ($companyId, $speciesId): void {
                    $query->where('company_id', $companyId)
                        ->where('species_id', $speciesId)
                        ->where('is_active', true);
                }),
            ],
        ];
    }

    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function administerRules(): array
    {
        return [
            'administered_on' => ['required', 'date', 'before_or_equal:today'],
            'administered_origin' => ['required', Rule::enum(VaccinationAdministeredOrigin::class)],
            'notes' => ['nullable', 'string', 'max:5000'],
        ];
    }

    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function omitRules(): array
    {
        return [
            'notes' => ['nullable', 'string', 'max:5000'],
        ];
    }

    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function updateScheduledRules(): array
    {
        return [
            'scheduled_on' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ];
    }

    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function updateAdministeredRules(): array
    {
        return [
            'scheduled_on' => ['required', 'date'],
            'administered_on' => ['required', 'date', 'before_or_equal:today'],
            'administered_origin' => ['required', Rule::enum(VaccinationAdministeredOrigin::class)],
            'notes' => ['nullable', 'string', 'max:5000'],
        ];
    }

    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function addManualRules(string $companyId): array
    {
        return [
            'product_id' => [
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
            'scheduled_on' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
