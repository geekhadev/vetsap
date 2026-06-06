<?php

namespace App\Actions\Agenda\Appointments;

use App\Models\Agenda\Appointment;
use Illuminate\Support\Carbon;

final class ShowAppointmentAction
{
    /**
     * @return array<string, mixed>
     */
    public function execute(Appointment $appointment): array
    {
        $appointment->load([
            'patient.species:id,name',
            'customer:id,name,phone,email,address,document_number',
            'doctor:id,first_name,last_name',
            'service:id,name',
            'office:id,name',
            'appointmentStatus:id,name,color,is_terminal',
        ]);

        $patient = $appointment->patient;
        $customer = $appointment->customer;
        $doctor = $appointment->doctor;
        $service = $appointment->service;
        $office = $appointment->office;
        $status = $appointment->appointmentStatus;

        return [
            'id' => $appointment->id,
            'starts_at' => Carbon::parse($appointment->starts_at)->toIso8601String(),
            'ends_at' => Carbon::parse($appointment->ends_at)->toIso8601String(),
            'duration_minutes' => (int) $appointment->duration_minutes,
            'price' => $appointment->price !== null ? (string) $appointment->price : null,
            'notes' => $appointment->notes,
            'status' => [
                'id' => $status->id,
                'name' => $status->name,
                'color' => $status->color->value,
                'is_terminal' => (bool) $status->is_terminal,
            ],
            'patient' => [
                'id' => $patient->id,
                'name' => $patient->name,
                'record_number' => $patient->record_number,
                'microchip_number' => $patient->microchip_number ?? '',
                'sex' => $patient->sex?->value ?? 'unknown',
                'birth_date' => $patient->birth_date?->format('Y-m-d'),
                'age_years' => $this->resolveAgeYears($patient->birth_date),
                'weight_kg' => $patient->weight_kg !== null ? (string) $patient->weight_kg : null,
                'colors' => $patient->colors ?? '',
                'blood_type' => $patient->blood_type ?? '',
                'species_name' => $patient->species?->name,
            ],
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'phone' => $customer->phone ?? '',
                'email' => $customer->email ?? '',
                'address' => $customer->address ?? '',
                'document_number' => $customer->document_number ?? '',
            ],
            'doctor' => [
                'id' => $doctor->id,
                'label' => trim(sprintf('%s %s', $doctor->first_name, $doctor->last_name)),
            ],
            'service' => [
                'id' => $service->id,
                'name' => $service->name,
            ],
            'office' => $office !== null
                ? ['id' => $office->id, 'name' => $office->name]
                : null,
        ];
    }

    private function resolveAgeYears(?Carbon $birthDate): ?int
    {
        if ($birthDate === null) {
            return null;
        }

        return (int) $birthDate->diffInYears(now());
    }
}
