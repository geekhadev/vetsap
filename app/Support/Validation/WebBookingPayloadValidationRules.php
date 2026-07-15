<?php

namespace App\Support\Validation;

use App\Models\Medic\Doctor;
use App\Models\Medic\Service;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

final class WebBookingPayloadValidationRules
{
    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function storeRules(string $companyId): array
    {
        return [
            'phone' => ['required', 'string', 'max:20'],
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
            'customer_id' => [
                'nullable',
                'uuid',
                Rule::exists('sale_customers', 'id')->where('company_id', $companyId),
            ],
            'client_name' => ['required_without:customer_id', 'nullable', 'string', 'max:255'],
            'client_email' => ['nullable', 'string', 'email', 'max:255'],
            'patient_id' => [
                'nullable',
                'uuid',
                Rule::exists('medic_patients', 'id')->where(fn ($query) => $query
                    ->where('company_id', $companyId)
                    ->where('is_active', true)),
            ],
            'pet_name' => ['required_without:patient_id', 'nullable', 'string', 'max:255'],
            'species_id' => [
                'required_without:patient_id',
                'nullable',
                'uuid',
                Rule::exists('medic_species', 'id')->where(fn ($query) => $query
                    ->where('is_active', true)
                    ->where(function ($inner) use ($companyId): void {
                        $inner->where('company_id', $companyId)
                            ->orWhere(function ($global): void {
                                $global->where('is_global', true)->whereNull('company_id');
                            });
                    })),
            ],
        ];
    }

    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function lookupRules(): array
    {
        return [
            'phone' => ['required', 'string', 'max:20'],
        ];
    }

    public static function assertDoctorProvidesWebService(string $doctorId, string $serviceId): void
    {
        $provides = Doctor::query()
            ->whereKey($doctorId)
            ->where('is_active', true)
            ->where('use_web', true)
            ->whereHas('services', fn ($query) => $query
                ->whereKey($serviceId)
                ->where('is_active', true)
                ->where('use_web', true))
            ->exists();

        if (! $provides) {
            throw ValidationException::withMessages([
                'doctor_id' => 'El doctor seleccionado no presta ese servicio en la web.',
            ]);
        }
    }

    public static function assertServiceIsWebVisible(string $serviceId): void
    {
        $visible = Service::query()
            ->whereKey($serviceId)
            ->where('is_active', true)
            ->where('use_web', true)
            ->exists();

        if (! $visible) {
            throw ValidationException::withMessages([
                'service_id' => 'El servicio seleccionado no está disponible en la web.',
            ]);
        }
    }
}
