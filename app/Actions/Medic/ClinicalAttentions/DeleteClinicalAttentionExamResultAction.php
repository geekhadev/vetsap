<?php

namespace App\Actions\Medic\ClinicalAttentions;

use App\Enums\Medic\ClinicalAttentionStatus;
use App\Models\Medic\ClinicalAttention;
use App\Models\Medic\Service;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

final class DeleteClinicalAttentionExamResultAction
{
    /**
     * @return array{
     *     id: string,
     *     name: string,
     *     is_uploaded: bool,
     *     file_url: null,
     *     file_name: null,
     *     mime_type: null,
     * }
     */
    public function execute(ClinicalAttention $attention, Service $service): array
    {
        if (
            $attention->status !== ClinicalAttentionStatus::Draft
            && $attention->status !== ClinicalAttentionStatus::Closed
        ) {
            throw new RuntimeException('No se pueden eliminar resultados de esta atención.');
        }

        $relation = $attention->requestedServices()
            ->where('medic_services.id', $service->id)
            ->first();

        if ($relation === null) {
            throw new RuntimeException('El examen no está solicitado en esta atención.');
        }

        return DB::transaction(function () use ($attention, $service, $relation): array {
            $previousPath = $relation->pivot->result_path;

            if (is_string($previousPath) && $previousPath !== '') {
                Storage::disk('public')->delete($previousPath);
            }

            $attention->requestedServices()->updateExistingPivot($service->id, [
                'result_path' => null,
                'result_original_name' => null,
                'result_mime_type' => null,
                'result_uploaded_at' => null,
            ]);

            return [
                'id' => $service->id,
                'name' => $service->name,
                'is_uploaded' => false,
                'file_url' => null,
                'file_name' => null,
                'mime_type' => null,
            ];
        });
    }
}
