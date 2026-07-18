<?php

namespace App\Actions\Medic\ClinicalAttentions;

use App\Enums\Medic\ClinicalAttentionStatus;
use App\Models\Medic\ClinicalAttention;
use App\Models\Medic\Patient;
use App\Support\Phone\WhatsappPhone;
use Illuminate\Support\Facades\URL;
use RuntimeException;

final class BuildPatientClinicalHistoryWhatsappShareUrlAction
{
    public function execute(Patient $patient): string
    {
        $patient->loadMissing(['customer', 'company']);

        $hasClosedAttentions = ClinicalAttention::query()
            ->where('patient_id', $patient->id)
            ->where('company_id', $patient->company_id)
            ->where('status', ClinicalAttentionStatus::Closed)
            ->exists();

        if (! $hasClosedAttentions) {
            throw new RuntimeException('El paciente no tiene atenciones cerradas para compartir.');
        }

        $phone = WhatsappPhone::internationalDigits($patient->customer?->phone);

        if ($phone === null) {
            throw new RuntimeException('El tutor no tiene un teléfono válido para WhatsApp.');
        }

        $pdfUrl = URL::temporarySignedRoute(
            'public.patients.clinical-history.pdf',
            now()->addDays(7),
            ['patient' => $patient->id],
        );

        $message = $this->message($patient, $pdfUrl);

        return WhatsappPhone::chatUrl($phone, $message);
    }

    private function message(Patient $patient, string $pdfUrl): string
    {
        $tutor = $patient->customer?->name ?: 'estimado/a';
        $patientName = $patient->name !== '' ? $patient->name : 'su mascota';
        $clinic = $patient->company?->name ?: 'la clínica';

        $lines = [
            "Hola {$tutor}, le saludamos de {$clinic}.",
            '',
            "Le compartimos el historial clínico de {$patientName}.",
            '',
            'Puede verlo o descargarlo en el siguiente enlace:',
            $pdfUrl,
            '',
            'El enlace estará disponible por 7 días.',
        ];

        return implode("\n", $lines);
    }
}
