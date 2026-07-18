<?php

namespace App\Actions\Medic\ClinicalAttentions;

use App\Enums\Medic\ClinicalAttentionStatus;
use App\Models\Agenda\Appointment;
use App\Models\Medic\ClinicalAttention;
use App\Models\Medic\ClinicalTemplate;
use App\Models\Medic\Patient;
use Illuminate\Support\Facades\DB;

final class StartAttentionFromAppointmentAction
{
    /**
     * Crea o actualiza el borrador del paciente vinculado a la cita (médico de la cita).
     *
     * @throws \RuntimeException
     */
    public function execute(Appointment $appointment, ?string $userId): ClinicalAttention
    {
        $appointment->loadMissing('patient:id,company_id');

        $patient = $appointment->patient;

        if (! $patient instanceof Patient) {
            throw new \RuntimeException('La cita no tiene un paciente asociado.');
        }

        return DB::transaction(function () use ($appointment, $patient, $userId): ClinicalAttention {
            /** @var ClinicalAttention|null $draft */
            $draft = ClinicalAttention::query()
                ->where('patient_id', $patient->id)
                ->where('status', ClinicalAttentionStatus::Draft)
                ->lockForUpdate()
                ->first();

            if ($draft instanceof ClinicalAttention) {
                $draft->update([
                    'appointment_id' => $appointment->id,
                    'doctor_id' => $draft->doctor_id ?: $appointment->doctor_id,
                    'updated_by_user_id' => $userId,
                ]);

                return $draft->refresh();
            }

            $templateId = ClinicalTemplate::query()
                ->forCompany($patient->company_id)
                ->where('is_active', true)
                ->orderByDesc('is_default')
                ->orderBy('name')
                ->value('id');

            if ($templateId === null) {
                throw new \RuntimeException('No hay plantillas clínicas activas para registrar la atención.');
            }

            /** @var ClinicalAttention $draft */
            $draft = ClinicalAttention::query()->create([
                'company_id' => $patient->company_id,
                'patient_id' => $patient->id,
                'appointment_id' => $appointment->id,
                'template_id' => $templateId,
                'doctor_id' => $appointment->doctor_id,
                'status' => ClinicalAttentionStatus::Draft,
                'started_at' => now(),
                'closed_at' => null,
                'created_by_user_id' => $userId,
                'updated_by_user_id' => $userId,
            ]);

            return $draft;
        });
    }
}
