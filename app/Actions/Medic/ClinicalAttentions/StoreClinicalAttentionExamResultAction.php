<?php

namespace App\Actions\Medic\ClinicalAttentions;

use App\Enums\Medic\ClinicalAttentionStatus;
use App\Models\Medic\ClinicalAttention;
use App\Models\Medic\Service;
use App\Support\Storage\PublicStorageUrl;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

final class StoreClinicalAttentionExamResultAction
{
    /**
     * @return array{
     *     id: string,
     *     name: string,
     *     is_uploaded: bool,
     *     file_url: string|null,
     *     file_name: string|null,
     *     mime_type: string|null,
     * }
     */
    public function execute(
        ClinicalAttention $attention,
        Service $service,
        UploadedFile $file,
    ): array {
        if (
            $attention->status !== ClinicalAttentionStatus::Draft
            && $attention->status !== ClinicalAttentionStatus::Closed
        ) {
            throw new RuntimeException('No se pueden cargar resultados en esta atención.');
        }

        $relation = $attention->requestedServices()
            ->where('medic_services.id', $service->id)
            ->first();

        if ($relation === null) {
            throw new RuntimeException('El examen no está solicitado en esta atención.');
        }

        return DB::transaction(function () use ($attention, $service, $file, $relation): array {
            $previousPath = $relation->pivot->result_path;

            if (is_string($previousPath) && $previousPath !== '') {
                Storage::disk('public')->delete($previousPath);
            }

            $extension = strtolower($file->getClientOriginalExtension() ?: $file->guessExtension() ?: 'bin');
            $filename = $this->buildResultFilename($service->name, $extension);
            $directory = sprintf(
                '%s/clinical-attentions/%s/exam-results',
                $attention->company_id,
                $attention->id,
            );
            $path = $file->storeAs($directory, $filename, 'public');

            if ($path === false) {
                throw new RuntimeException('No se pudo guardar el archivo del examen.');
            }

            $attention->requestedServices()->updateExistingPivot($service->id, [
                'result_path' => $path,
                'result_original_name' => $filename,
                'result_mime_type' => $file->getClientMimeType() ?: $file->getMimeType(),
                'result_uploaded_at' => now(),
            ]);

            return [
                'id' => $service->id,
                'name' => $service->name,
                'is_uploaded' => true,
                'file_url' => PublicStorageUrl::fromRelativePath($path),
                'file_name' => $filename,
                'mime_type' => $file->getClientMimeType() ?: $file->getMimeType(),
            ];
        });
    }

    protected function buildResultFilename(string $examName, string $extension): string
    {
        $slug = Str::slug($examName);

        if ($slug === '') {
            $slug = 'examen';
        }

        return sprintf('%s-%s.%s', $slug, now()->format('Y-m-d'), $extension);
    }
}
