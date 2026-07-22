<?php

namespace App\Support\Validation;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

final class CustomerAppointmentPayloadValidationRules
{
    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function storeRules(string $companyId): array
    {
        return [
            'patient_id' => [
                'required',
                'uuid',
                Rule::exists('medic_patients', 'id')->where(fn ($query) => $query
                    ->where('company_id', $companyId)
                    ->where('is_active', true)),
            ],
            'service_id' => [
                'required',
                'uuid',
                Rule::exists('medic_services', 'id')->where(fn ($query) => $query
                    ->where('company_id', $companyId)
                    ->where('is_active', true)
                    ->where('use_web', true)),
            ],
            'doctor_id' => [
                'required',
                'uuid',
                Rule::exists('medic_doctors', 'id')->where(fn ($query) => $query
                    ->where('company_id', $companyId)
                    ->where('is_active', true)
                    ->where('use_web', true)),
            ],
            'appointment_date' => ['required', 'date', 'after_or_equal:today'],
            'starts_at_time' => ['required', 'date_format:H:i'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
