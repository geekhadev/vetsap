<?php

namespace App\Actions\Medic\ClinicalAttentions;

use App\Actions\Sale\SaleDocuments\EnsureDraftSaleDocumentForAttentionAction;
use App\Enums\Medic\ClinicalAttentionStatus;
use App\Models\Agenda\Appointment;
use App\Models\Medic\ClinicalAttention;
use App\Models\Medic\ClinicalTemplate;
use App\Models\Medic\Patient;
use App\Models\Medic\PatientVaccinationDose;
use App\Support\Medic\StartAttentionFromAppointmentWindow;
use Illuminate\Support\Facades\DB;

final class StartAttentionFromAppointmentAction
{
    public function __construct(
        private EnsureDraftSaleDocumentForAttentionAction $ensureDraftSaleDocument,
    ) {}

    /**
     * Crea o actualiza el borrador del paciente vinculado a la cita (médico de la cita).
     *
     * @throws \RuntimeException
     */
    public function execute(Appointment $appointment, ?string $userId): ClinicalAttention
    {
        $appointment->loadMissing([
            'patient:id,company_id,customer_id',
            'service:id,name,price,tax_treatment',
        ]);

        $patient = $appointment->patient;

        if (! $patient instanceof Patient) {
            throw new \RuntimeException('La cita no tiene un paciente asociado.');
        }

        if (PatientVaccinationDose::query()->where('appointment_id', $appointment->id)->exists()) {
            throw new \RuntimeException(
                'Esta cita está ligada a vacunación. Registra la aplicación en el plan del paciente; no se inicia atención clínica.',
            );
        }

        if (! StartAttentionFromAppointmentWindow::contains($appointment->starts_at)) {
            $bounds = StartAttentionFromAppointmentWindow::bounds($appointment->starts_at);

            throw new \RuntimeException(sprintf(
                'La atención solo se puede iniciar entre %s y %s.',
                $bounds['earliest']->format('d/m/Y H:i'),
                $bounds['latest']->format('d/m/Y H:i'),
            ));
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
            } else {
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
            }

            $draft = $draft->refresh()->load([
                'patient.customer',
                'appointment.service',
                'requestedServices',
            ]);
            $this->ensureDraftSaleDocument->execute($draft, $userId);

            return $draft;
        });
    }
}
