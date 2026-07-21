<?php

namespace App\Support\Medic;

use App\Enums\Medic\VaccinationAdministeredOrigin;
use App\Enums\Medic\VaccinationDoseStatus;
use App\Enums\Medic\VaccinationScheduleType;
use App\Enums\Sale\SaleDocumentStatus;
use App\Models\Medic\PatientVaccinationDose;
use App\Models\Medic\VaccinationProtocolItem;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

final class VaccinationDoseSchedule
{
    /**
     * @param  Collection<int, VaccinationProtocolItem>  $items
     * @return list<array{
     *     product_id: string,
     *     series_key: string|null,
     *     sequence: int,
     *     scheduled_on: string,
     *     status: string,
     *     source: string
     * }>
     */
    public static function generateFromProtocolItems(Collection $items, CarbonImmutable $birthDate): array
    {
        $today = CarbonImmutable::today();
        $seriesCounters = [];
        $doses = [];

        foreach ($items->values() as $item) {
            $seriesKey = $item->series_key;
            $sequence = 0;

            if (is_string($seriesKey) && $seriesKey !== '') {
                $seriesCounters[$seriesKey] = ($seriesCounters[$seriesKey] ?? 0) + 1;
                $sequence = $seriesCounters[$seriesKey];
            }

            $scheduledOn = self::scheduledDateForItem($item, $birthDate);
            $status = self::openStatusForDate($scheduledOn, $today);

            $doses[] = [
                'product_id' => $item->product_id,
                'series_key' => $seriesKey,
                'sequence' => $sequence,
                'scheduled_on' => $scheduledOn->toDateString(),
                'status' => $status->value,
                'source' => 'protocol',
            ];
        }

        return $doses;
    }

    public static function scheduledDateForItem(
        VaccinationProtocolItem $item,
        CarbonImmutable $birthDate,
    ): CarbonImmutable {
        return match ($item->schedule_type) {
            VaccinationScheduleType::FromBirthWeeks => $birthDate->addWeeks((int) $item->week_number),
            VaccinationScheduleType::Unique => $birthDate->addWeeks((int) ($item->min_age_weeks ?? 0)),
            VaccinationScheduleType::Periodic => $birthDate->addMonths((int) ($item->interval_months ?? 12)),
        };
    }

    public static function openStatusForDate(
        CarbonImmutable $scheduledOn,
        ?CarbonImmutable $today = null,
    ): VaccinationDoseStatus {
        $today ??= CarbonImmutable::today();

        if ($scheduledOn->lessThan($today)) {
            return VaccinationDoseStatus::Overdue;
        }

        if ($scheduledOn->equalTo($today)) {
            return VaccinationDoseStatus::Due;
        }

        return VaccinationDoseStatus::Scheduled;
    }

    /**
     * Estado efectivo para UI: rederive due/overdue si aún está abierta.
     */
    public static function effectiveStatus(PatientVaccinationDose $dose): VaccinationDoseStatus
    {
        if (
            $dose->status === VaccinationDoseStatus::Administered
            || $dose->status === VaccinationDoseStatus::Omitted
        ) {
            return $dose->status;
        }

        return self::openStatusForDate(
            CarbonImmutable::parse($dose->scheduled_on->toDateString()),
        );
    }

    /**
     * Persiste due/overdue al listar (MVP sin job).
     *
     * @param  iterable<int, PatientVaccinationDose>  $doses
     */
    public static function syncOpenStatuses(iterable $doses): void
    {
        $today = CarbonImmutable::today();

        foreach ($doses as $dose) {
            if (
                $dose->status === VaccinationDoseStatus::Administered
                || $dose->status === VaccinationDoseStatus::Omitted
            ) {
                continue;
            }

            $effective = self::openStatusForDate(
                CarbonImmutable::parse($dose->scheduled_on->toDateString()),
                $today,
            );

            if ($dose->status === $effective) {
                continue;
            }

            $dose->forceFill(['status' => $effective])->saveQuietly();
        }
    }

    /**
     * @return array{
     *     id: string,
     *     product_name: string,
     *     plan_name: string,
     *     status: string,
     *     source: string,
     *     administered_origin: string|null,
     *     series_label: string|null,
     *     scheduled_on: string,
     *     administered_on: string|null,
     *     notes: string|null,
     *     billing_status: string,
     *     appointment_id: string|null,
     *     appointment_starts_at: string|null,
     *     appointment_misaligned: bool
     * }
     */
    public static function toTimelineSummary(
        PatientVaccinationDose $dose,
        string $planName,
    ): array {
        $status = self::effectiveStatus($dose);
        $seriesLabel = null;

        if (is_string($dose->series_key) && $dose->series_key !== '' && $dose->sequence > 0) {
            $seriesLabel = 'Serie · dosis '.$dose->sequence;
        }

        $appointmentStartsAt = $dose->appointment?->starts_at?->toIso8601String();
        $appointmentDate = $dose->appointment?->starts_at?->toDateString();
        $scheduledOn = $dose->scheduled_on->toDateString();

        return [
            'id' => $dose->id,
            'product_name' => $dose->product?->name ?? 'Vacuna',
            'plan_name' => $planName,
            'status' => $status->value,
            'source' => $dose->source->value,
            'administered_origin' => $dose->administered_origin?->value,
            'series_label' => $seriesLabel,
            'scheduled_on' => $scheduledOn,
            'administered_on' => $dose->administered_on?->toIso8601String(),
            'notes' => $dose->notes,
            'billing_status' => self::billingStatus($dose),
            'appointment_id' => $dose->appointment_id,
            'appointment_starts_at' => $appointmentStartsAt,
            'appointment_misaligned' => is_string($appointmentDate)
                && $appointmentDate !== $scheduledOn,
        ];
    }

    /**
     * none | external | pending | charged
     */
    public static function billingStatus(PatientVaccinationDose $dose): string
    {
        if ($dose->status !== VaccinationDoseStatus::Administered) {
            return 'none';
        }

        if ($dose->administered_origin === VaccinationAdministeredOrigin::External) {
            return 'external';
        }

        $detail = $dose->saleDocumentDetail;

        if ($detail === null) {
            return 'none';
        }

        $documentStatus = $detail->saleDocument?->status;

        return match ($documentStatus) {
            SaleDocumentStatus::Draft => 'pending',
            SaleDocumentStatus::Issued => 'charged',
            default => 'none',
        };
    }
}
