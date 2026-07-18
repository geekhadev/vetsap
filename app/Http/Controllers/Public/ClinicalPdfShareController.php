<?php

namespace App\Http\Controllers\Public;

use App\Actions\Medic\ClinicalAttentions\GenerateClinicalAttentionPdfAction;
use App\Actions\Medic\ClinicalAttentions\GeneratePatientClinicalHistoryPdfAction;
use App\Enums\Medic\ClinicalAttentionStatus;
use App\Http\Controllers\Controller;
use App\Models\Medic\ClinicalAttention;
use App\Models\Medic\Patient;
use Illuminate\Http\Response as HttpResponse;
use RuntimeException;

class ClinicalPdfShareController extends Controller
{
    public function attention(
        ClinicalAttention $clinicalAttention,
        GenerateClinicalAttentionPdfAction $action,
    ): HttpResponse {
        if ($clinicalAttention->status !== ClinicalAttentionStatus::Closed) {
            abort(404);
        }

        $pdf = $action->execute($clinicalAttention);

        return response($pdf['content'], 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$pdf['filename'].'"',
        ]);
    }

    public function history(
        Patient $patient,
        GeneratePatientClinicalHistoryPdfAction $action,
    ): HttpResponse {
        try {
            $pdf = $action->execute($patient);
        } catch (RuntimeException) {
            abort(404);
        }

        return response($pdf['content'], 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$pdf['filename'].'"',
        ]);
    }
}
