<?php

namespace App\Support\Validation;

use App\Enums\Medic\PatientSex;
use App\Models\Medic\Patient;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

final class PatientPayloadValidationRules
{
    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function storeRules(string $companyId, ?string $patientId = null): array
    {
        $microchipUnique = Rule::unique('medic_patients', 'microchip_number')
            ->where(fn ($query) => $query->where('company_id', $companyId));

        if ($patientId !== null) {
            $microchipUnique = $microchipUnique->ignore($patientId);
        }

        return [
            'customer_id' => [
                'required',
                'uuid',
                Rule::exists('sale_customers', 'id')->where('company_id', $companyId),
            ],
            'species_id' => [
                'required',
                'uuid',
                Rule::exists('medic_species', 'id')
                    ->where(fn ($query) => $query
                        ->where('company_id', $companyId)
                        ->where('is_active', true)),
            ],
            'record_number' => [
                'required',
                'string',
                'max:50',
                Rule::unique('medic_patients', 'record_number')
                    ->where('company_id', $companyId)
                    ->ignore($patientId),
            ],
            'name' => ['required', 'string', 'max:255'],
            'breed' => ['nullable', 'string', 'max:255'],
            'sex' => ['required', Rule::enum(PatientSex::class)],
            'birth_date' => ['nullable', 'date', 'before_or_equal:today'],
            'weight_kg' => ['nullable', 'numeric', 'min:0', 'max:9999.99'],
            'is_sterilized' => ['boolean'],
            'colors' => ['nullable', 'string', 'max:500'],
            'blood_type' => ['nullable', 'string', 'max:50'],
            'microchip_number' => ['nullable', 'string', 'max:50', $microchipUnique],
            'is_active' => ['boolean'],
            'redirect_to' => ['nullable', 'string', Rule::in(['customers', 'patients'])],
        ];
    }

    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function updateRules(string $companyId, Patient $patient): array
    {
        return self::storeRules($companyId, $patient->id);
    }

    /**
     * @param  array<string, mixed>  $input
     * @return array<string, mixed>
     */
    public static function mergeNormalizedNullableFields(array $input): array
    {
        $nullable = ['breed', 'birth_date', 'weight_kg', 'colors', 'blood_type', 'microchip_number'];
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
     *     customer_id: string,
     *     species_id: string,
     *     record_number: string,
     *     name: string,
     *     breed: string|null,
     *     sex: PatientSex,
     *     birth_date: string|null,
     *     weight_kg: string|null,
     *     is_sterilized: bool,
     *     colors: string|null,
     *     blood_type: string|null,
     *     microchip_number: string|null,
     *     is_active: bool
     * }
     */
    public static function payload(string $companyId, array $validated): array
    {
        $sex = $validated['sex'];

        return [
            'company_id' => $companyId,
            'customer_id' => (string) $validated['customer_id'],
            'species_id' => (string) $validated['species_id'],
            'record_number' => (string) $validated['record_number'],
            'name' => (string) $validated['name'],
            'breed' => $validated['breed'] ?? null,
            'sex' => $sex instanceof PatientSex ? $sex : PatientSex::from((string) $sex),
            'birth_date' => $validated['birth_date'] ?? null,
            'weight_kg' => isset($validated['weight_kg']) ? (string) $validated['weight_kg'] : null,
            'is_sterilized' => (bool) ($validated['is_sterilized'] ?? false),
            'colors' => $validated['colors'] ?? null,
            'blood_type' => $validated['blood_type'] ?? null,
            'microchip_number' => $validated['microchip_number'] ?? null,
            'is_active' => (bool) ($validated['is_active'] ?? true),
        ];
    }
}
