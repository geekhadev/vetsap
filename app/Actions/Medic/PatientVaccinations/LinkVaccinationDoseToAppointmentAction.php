<?php

namespace App\Actions\Medic\PatientVaccinations;

use App\Models\Agenda\Appointment;
use App\Models\Medic\PatientVaccinationDose;
use App\Models\Medic\PatientVaccinationPlan;
use InvalidArgumentException;

final class LinkVaccinationDoseToAppointmentAction
{
    public function execute(
        PatientVaccinationDose $dose,
        Appointment $appointment,
    ): PatientVaccinationDose {
        $dose->loadMissing('plan:id,patient_id,company_id');

        $plan = $dose->plan;

        if (! $plan instanceof PatientVaccinationPlan) {
            throw new InvalidArgumentException('La dosis no tiene plan.');
        }

        if ($appointment->patient_id !== $plan->patient_id) {
            throw new InvalidArgumentException('La cita no corresponde al paciente de la dosis.');
        }

        if ($appointment->company_id !== $plan->company_id) {
            throw new InvalidArgumentException('La cita no pertenece a la empresa del plan.');
        }

        $dose->update(['appointment_id' => $appointment->id]);

        return $dose->refresh()->load(['product:id,name', 'appointment:id,starts_at']);
    }
}
