<?php

namespace App\Actions\Medic\PatientVaccinations;

use App\Enums\Medic\VaccinationDoseSource;
use App\Enums\Medic\VaccinationDoseStatus;
use App\Models\Medic\Patient;
use App\Models\Medic\PatientVaccinationPlan;
use App\Models\Medic\VaccinationProtocol;
use App\Support\Medic\VaccinationDoseSchedule;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

final class AssignVaccinationPlanAction
{
    /**
     * @throws InvalidArgumentException
     */
    public function execute(
        Patient $patient,
        VaccinationProtocol $protocol,
        ?string $assignedByUserId,
    ): PatientVaccinationPlan {
        if ($patient->birth_date === null) {
            throw new InvalidArgumentException('El paciente debe tener fecha de nacimiento.');
        }

        if ($patient->species_id !== $protocol->species_id) {
            throw new InvalidArgumentException('El protocolo no corresponde a la especie del paciente.');
        }

        if ($patient->company_id !== $protocol->company_id) {
            throw new InvalidArgumentException('El protocolo no pertenece a la empresa del paciente.');
        }

        if (! $protocol->is_active) {
            throw new InvalidArgumentException('El protocolo no está activo.');
        }

        if (PatientVaccinationPlan::query()->where('patient_id', $patient->id)->exists()) {
            throw new InvalidArgumentException('El paciente ya tiene un plan de vacunación asignado.');
        }

        $protocol->load(['items.product:id,name', 'species:id,name']);

        if ($protocol->items->isEmpty()) {
            throw new InvalidArgumentException('El protocolo no tiene dosis configuradas.');
        }

        $birthDate = CarbonImmutable::parse($patient->birth_date->toDateString());

        return DB::transaction(function () use ($patient, $protocol, $assignedByUserId, $birthDate): PatientVaccinationPlan {
            $snapshot = [
                'protocol_id' => $protocol->id,
                'name' => $protocol->name,
                'description' => $protocol->description,
                'version' => $protocol->version,
                'species_id' => $protocol->species_id,
                'species_name' => $protocol->species?->name,
                'items' => $protocol->items->map(static fn ($item): array => [
                    'product_id' => $item->product_id,
                    'product_name' => $item->product?->name,
                    'schedule_type' => $item->schedule_type->value,
                    'week_number' => $item->week_number,
                    'min_age_weeks' => $item->min_age_weeks,
                    'max_age_weeks' => $item->max_age_weeks,
                    'interval_months' => $item->interval_months,
                    'series_key' => $item->series_key,
                    'sort_order' => $item->sort_order,
                ])->values()->all(),
            ];

            /** @var PatientVaccinationPlan $plan */
            $plan = PatientVaccinationPlan::query()->create([
                'company_id' => $patient->company_id,
                'patient_id' => $patient->id,
                'protocol_id' => $protocol->id,
                'protocol_snapshot' => $snapshot,
                'assigned_at' => now(),
                'assigned_by' => $assignedByUserId,
            ]);

            $doseRows = VaccinationDoseSchedule::generateFromProtocolItems($protocol->items, $birthDate);

            foreach ($doseRows as $row) {
                $plan->doses()->create([
                    ...$row,
                    'status' => VaccinationDoseStatus::from($row['status']),
                    'source' => VaccinationDoseSource::Protocol,
                    'administered_on' => null,
                    'administered_origin' => null,
                    'notes' => null,
                    'recorded_by' => null,
                ]);
            }

            return $plan->load(['doses.product:id,name']);
        });
    }
}
