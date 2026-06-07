<?php

namespace App\Support\Validation;

use App\Enums\Agenda\AppointmentSource;
use App\Models\Agenda\Appointment;
use App\Models\Agenda\AppointmentStatus;
use App\Models\Agenda\Holiday;
use App\Models\CompanyOffice;
use App\Models\Medic\Doctor;
use App\Models\Medic\DoctorScheduleBlock;
use App\Models\Medic\Patient;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

final class AppointmentPayloadValidationRules
{
    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function storeRules(string $companyId): array
    {
        return [
            'customer_id' => [
                'required',
                'uuid',
                Rule::exists('sale_customers', 'id')->where('company_id', $companyId),
            ],
            'patient_id' => [
                'required',
                'uuid',
                Rule::exists('medic_patients', 'id')->where('company_id', $companyId),
            ],
            'doctor_id' => [
                'required',
                'uuid',
                Rule::exists('medic_doctors', 'id')->where('company_id', $companyId),
            ],
            'service_id' => [
                'required',
                'uuid',
                Rule::exists('medic_services', 'id')->where('company_id', $companyId),
            ],
            'office_id' => [
                'nullable',
                'uuid',
                Rule::exists('configuration_company_offices', 'id')->where('company_id', $companyId),
            ],
            'appointment_date' => ['required', 'date', 'after_or_equal:today'],
            'starts_at_time' => ['required', 'date_format:H:i'],
            'notes' => ['nullable', 'string', 'max:5000'],
            'public_notes' => ['nullable', 'string', 'max:5000'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function validatedSchedulingWindow(array $validated, string $companyId, int $durationMinutes): array
    {
        $startsAt = Carbon::parse(
            sprintf('%s %s:00', $validated['appointment_date'], $validated['starts_at_time']),
        );
        $endsAt = $startsAt->copy()->addMinutes($durationMinutes);

        self::assertAppointmentSchedulingAvailability(
            $companyId,
            (string) $validated['doctor_id'],
            $startsAt,
            $endsAt,
        );
        self::assertPatientBelongsToCustomer(
            (string) $validated['patient_id'],
            (string) $validated['customer_id'],
        );
        self::assertDoctorProvidesService(
            (string) $validated['doctor_id'],
            (string) $validated['service_id'],
        );

        if ($validated['office_id'] ?? null) {
            self::assertOfficeBelongsToCompany((string) $validated['office_id'], $companyId);
        }

        return [
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
        ];
    }

    /**
     * @return array{
     *     company_id: string,
     *     doctor_id: string,
     *     service_id: string,
     *     customer_id: string,
     *     patient_id: string,
     *     office_id: string|null,
     *     starts_at: Carbon,
     *     ends_at: Carbon,
     *     duration_minutes: int,
     *     price: string|null,
     *     source: AppointmentSource,
     *     notes: string|null,
     *     public_notes: string|null,
     * }
     */
    public static function storePayload(
        string $companyId,
        array $validated,
        int $durationMinutes,
        ?string $price,
        Carbon $startsAt,
        Carbon $endsAt,
        AppointmentSource $source = AppointmentSource::Internal,
    ): array {
        return [
            'company_id' => $companyId,
            'doctor_id' => (string) $validated['doctor_id'],
            'service_id' => (string) $validated['service_id'],
            'customer_id' => (string) $validated['customer_id'],
            'patient_id' => (string) $validated['patient_id'],
            'office_id' => isset($validated['office_id']) && $validated['office_id'] !== ''
                ? (string) $validated['office_id']
                : null,
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'duration_minutes' => $durationMinutes,
            'price' => $price,
            'source' => $source,
            'notes' => isset($validated['notes']) ? (string) $validated['notes'] : null,
            'public_notes' => isset($validated['public_notes']) ? (string) $validated['public_notes'] : null,
        ];
    }

    protected static function assertNotHoliday(string $companyId, Carbon $startsAt): void
    {
        $isHoliday = Holiday::query()
            ->forCompany($companyId)
            ->where('is_active', true)
            ->whereDate('date', $startsAt->toDateString())
            ->exists();

        if ($isHoliday) {
            throw ValidationException::withMessages([
                'appointment_date' => 'No se pueden agendar citas en un día feriado.',
            ]);
        }
    }

    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function rescheduleRules(): array
    {
        return [
            'appointment_date' => ['required', 'date', 'after_or_equal:today'],
            'starts_at_time' => ['required', 'date_format:H:i'],
        ];
    }

    /**
     * @return array{starts_at: Carbon, ends_at: Carbon}
     */
    public static function validatedRescheduleWindow(
        array $validated,
        string $companyId,
        int $durationMinutes,
        string $doctorId,
        string $exceptAppointmentId,
    ): array {
        $startsAt = Carbon::parse(
            sprintf('%s %s:00', $validated['appointment_date'], $validated['starts_at_time']),
        );
        $endsAt = $startsAt->copy()->addMinutes($durationMinutes);

        self::assertAppointmentSchedulingAvailability(
            $companyId,
            $doctorId,
            $startsAt,
            $endsAt,
            $exceptAppointmentId,
        );

        return [
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
        ];
    }

    protected static function assertAppointmentSchedulingAvailability(
        string $companyId,
        string $doctorId,
        Carbon $startsAt,
        Carbon $endsAt,
        ?string $exceptAppointmentId = null,
    ): void {
        self::assertNotHoliday($companyId, $startsAt);
        self::assertNotInPast($startsAt);
        self::assertWithinDoctorSchedule($doctorId, $startsAt, $endsAt);
        self::assertDoctorAvailable(
            $companyId,
            $doctorId,
            $startsAt,
            $endsAt,
            $exceptAppointmentId,
        );
    }

    protected static function assertDoctorAvailable(
        string $companyId,
        string $doctorId,
        Carbon $startsAt,
        Carbon $endsAt,
        ?string $exceptAppointmentId = null,
    ): void {
        $overlapExists = Appointment::query()
            ->forCompany($companyId)
            ->overlappingForDoctor($doctorId, $startsAt, $endsAt, $exceptAppointmentId)
            ->exists();

        if ($overlapExists) {
            throw ValidationException::withMessages([
                'starts_at_time' => 'El doctor ya tiene una cita en ese horario.',
            ]);
        }
    }

    protected static function assertNotInPast(Carbon $startsAt): void
    {
        if ($startsAt->isPast()) {
            throw ValidationException::withMessages([
                'starts_at_time' => 'No se puede agendar en una fecha u hora pasada.',
            ]);
        }
    }

    protected static function assertWithinDoctorSchedule(
        string $doctorId,
        Carbon $startsAt,
        Carbon $endsAt,
    ): void {
        $dayOfWeek = $startsAt->dayOfWeekIso;

        $blocks = DoctorScheduleBlock::query()
            ->where('doctor_id', $doctorId)
            ->where('day_of_week', $dayOfWeek)
            ->get(['starts_at', 'ends_at']);

        if ($blocks->isEmpty()) {
            throw ValidationException::withMessages([
                'appointment_date' => 'El doctor no tiene agenda configurada para ese día.',
            ]);
        }

        $startMinutes = $startsAt->hour * 60 + $startsAt->minute;
        $endMinutes = $endsAt->hour * 60 + $endsAt->minute;

        if ($endsAt->toDateString() !== $startsAt->toDateString()) {
            throw ValidationException::withMessages([
                'starts_at_time' => 'La cita no cabe en el horario del día seleccionado.',
            ]);
        }

        $fits = $blocks->contains(static function (DoctorScheduleBlock $block) use ($startMinutes, $endMinutes): bool {
            $blockStart = self::timeToMinutes(substr((string) $block->starts_at, 0, 5));
            $blockEnd = self::timeToMinutes(substr((string) $block->ends_at, 0, 5));

            return $startMinutes >= $blockStart && $endMinutes <= $blockEnd;
        });

        if (! $fits) {
            throw ValidationException::withMessages([
                'starts_at_time' => 'Fuera del horario de atención del doctor.',
            ]);
        }
    }

    protected static function timeToMinutes(string $time): int
    {
        [$hours, $minutes] = array_map(intval(...), explode(':', $time));

        return $hours * 60 + $minutes;
    }

    protected static function assertPatientBelongsToCustomer(string $patientId, string $customerId): void
    {
        $belongs = Patient::query()
            ->whereKey($patientId)
            ->where('customer_id', $customerId)
            ->exists();

        if (! $belongs) {
            throw ValidationException::withMessages([
                'patient_id' => 'El paciente seleccionado no pertenece al cliente indicado.',
            ]);
        }
    }

    protected static function assertDoctorProvidesService(string $doctorId, string $serviceId): void
    {
        $provides = Doctor::query()
            ->whereKey($doctorId)
            ->whereHas('services', fn ($query) => $query->whereKey($serviceId))
            ->exists();

        if (! $provides) {
            throw ValidationException::withMessages([
                'doctor_id' => 'El doctor seleccionado no presta ese servicio.',
            ]);
        }
    }

    protected static function assertOfficeBelongsToCompany(string $officeId, string $companyId): void
    {
        $belongs = CompanyOffice::query()
            ->whereKey($officeId)
            ->where('company_id', $companyId)
            ->exists();

        if (! $belongs) {
            throw ValidationException::withMessages([
                'office_id' => 'La sucursal seleccionada no pertenece a la empresa activa.',
            ]);
        }
    }

    public static function defaultPendingStatusId(): string
    {
        /** @var AppointmentStatus|null $status */
        $status = AppointmentStatus::query()
            ->where('name', 'Pendiente')
            ->where('is_active', true)
            ->where(function ($query): void {
                $query->where('is_global', true)->whereNull('company_id');
            })
            ->first();

        if (! $status instanceof AppointmentStatus) {
            throw new \RuntimeException('No se encontró el estado global «Pendiente».');
        }

        return $status->id;
    }
}
