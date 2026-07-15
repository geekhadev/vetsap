<?php

namespace App\Actions\Medic\Patients;

use App\Models\Medic\Patient;
use App\Support\Storage\PublicStorageUrl;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

final class StorePatientPhotoAction
{
    /**
     * Guarda la foto del paciente en el disco público y actualiza `photo_path`.
     */
    public function execute(Patient $patient, UploadedFile $file): string
    {
        $previousPath = $patient->photo_path;

        if (is_string($previousPath) && $previousPath !== '') {
            Storage::disk('public')->delete($previousPath);
        }

        $extension = strtolower($file->getClientOriginalExtension() ?: $file->guessExtension() ?: 'jpg');
        $directory = sprintf('%s/patients/%s', $patient->company_id, $patient->id);
        $filename = 'photo.'.$extension;
        $path = "{$directory}/{$filename}";

        Storage::disk('public')->putFileAs($directory, $file, $filename);

        $patient->update([
            'photo_path' => $path,
        ]);

        return PublicStorageUrl::fromRelativePath($path) ?? '';
    }
}
