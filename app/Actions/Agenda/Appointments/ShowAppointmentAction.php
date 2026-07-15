<?php

namespace App\Actions\Agenda\Appointments;

use App\Enums\Medic\DoctorScheduleDayOfWeek;
use App\Models\Agenda\Appointment;
use App\Models\Web\ClinicWebSetting;
use App\Support\Web\ClinicWebSettingKeys;
use Carbon\CarbonInterface;
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
            'doctor.scheduleBlocks' => fn ($query) => $query
                ->orderBy('day_of_week')
                ->orderBy('starts_at'),
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
        $clinicWeb = $this->resolveClinicWebShareSettings($appointment->company_id);

        return [
            'id' => $appointment->id,
            'starts_at' => Carbon::parse($appointment->starts_at)->toIso8601String(),
            'ends_at' => Carbon::parse($appointment->ends_at)->toIso8601String(),
            'duration_minutes' => (int) $appointment->duration_minutes,
            'price' => $appointment->price !== null ? (string) $appointment->price : null,
            'notes' => $appointment->notes,
            'clinic_map_url' => $clinicWeb['map_url'],
            'clinic_facebook_url' => $clinicWeb['facebook_url'],
            'clinic_instagram_url' => $clinicWeb['instagram_url'],
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
                'schedule_windows' => $doctor->scheduleBlocks
                    ->map(static function ($block): array {
                        $dayOfWeek = $block->day_of_week;

                        return [
                            'day_of_week' => $dayOfWeek instanceof DoctorScheduleDayOfWeek
                                ? $dayOfWeek->value
                                : (int) $dayOfWeek,
                            'starts_at' => substr((string) $block->starts_at, 0, 5),
                            'ends_at' => substr((string) $block->ends_at, 0, 5),
                        ];
                    })
                    ->values()
                    ->all(),
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

    /**
     * @return array{map_url: string|null, facebook_url: string|null, instagram_url: string|null}
     */
    private function resolveClinicWebShareSettings(string $companyId): array
    {
        $settings = ClinicWebSetting::query()
            ->where('company_id', $companyId)
            ->whereIn('key', [
                ClinicWebSettingKeys::CONTACT_MAP_URL,
                ClinicWebSettingKeys::FACEBOOK_URL,
                ClinicWebSettingKeys::INSTAGRAM_URL,
            ])
            ->pluck('value', 'key');

        return [
            'map_url' => $this->nullableTrimmedString($settings->get(ClinicWebSettingKeys::CONTACT_MAP_URL)),
            'facebook_url' => $this->nullableTrimmedString($settings->get(ClinicWebSettingKeys::FACEBOOK_URL)),
            'instagram_url' => $this->nullableTrimmedString($settings->get(ClinicWebSettingKeys::INSTAGRAM_URL)),
        ];
    }

    private function nullableTrimmedString(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed !== '' ? $trimmed : null;
    }

    private function resolveAgeYears(?CarbonInterface $birthDate): ?int
    {
        if ($birthDate === null) {
            return null;
        }

        return (int) $birthDate->diffInYears(now());
    }
}
