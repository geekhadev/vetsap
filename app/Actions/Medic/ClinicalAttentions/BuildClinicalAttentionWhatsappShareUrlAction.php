<?php

namespace App\Actions\Medic\ClinicalAttentions;

use App\Models\Medic\ClinicalAttention;
use App\Support\Phone\WhatsappPhone;
use Illuminate\Support\Facades\URL;
use RuntimeException;

final class BuildClinicalAttentionWhatsappShareUrlAction
{
    public function execute(ClinicalAttention $attention): string
    {
        $attention->loadMissing(['patient.customer', 'company', 'template']);

        $phone = WhatsappPhone::internationalDigits($attention->patient?->customer?->phone);

        if ($phone === null) {
            throw new RuntimeException('El tutor no tiene un teléfono válido para WhatsApp.');
        }

        $pdfUrl = URL::temporarySignedRoute(
            'public.clinical-attentions.pdf',
            now()->addDays(7),
            ['clinical_attention' => $attention->id],
        );

        $message = $this->message($attention, $pdfUrl);

        return WhatsappPhone::chatUrl($phone, $message);
    }

    private function message(ClinicalAttention $attention, string $pdfUrl): string
    {
        $tutor = $attention->patient?->customer?->name ?: 'estimado/a';
        $patient = $attention->patient?->name ?: 'su mascota';
        $clinic = $attention->company?->name ?: 'la clínica';
        $attentionAt = $attention->closed_at ?? $attention->started_at ?? $attention->created_at;
        $date = $attentionAt
            ?->timezone(config('app.timezone'))
            ->format('d/m/Y H:i') ?? '—';
        $template = $attention->template?->name;

        $lines = [
            "Hola {$tutor}, le saludamos de {$clinic}.",
            '',
            "Le compartimos el informe clínico de {$patient}".($template ? " ({$template})" : '')." correspondiente a la atención del {$date}.",
            '',
            'Puede verlo o descargarlo en el siguiente enlace:',
            $pdfUrl,
            '',
            'El enlace estará disponible por 7 días.',
        ];

        return implode("\n", $lines);
    }
}
