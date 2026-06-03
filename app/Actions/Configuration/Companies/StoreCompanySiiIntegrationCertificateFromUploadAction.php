<?php

namespace App\Actions\Configuration\Companies;

use App\Actions\Sale\CertificationSiiTickets\GenerateCertificationSiiBoletaXmlAction;
use App\Models\Company;
use App\Support\Storage\CompanyPrivateStorageLayout;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

final class StoreCompanySiiIntegrationCertificateFromUploadAction
{
    /**
     * Guarda el certificado en disco local privado y devuelve una URI absoluta con esquema file://
     * compatible con {@see GenerateCertificationSiiBoletaXmlAction}.
     */
    public function execute(Company $company, UploadedFile $file, ?string $previousStoredLocation): string
    {
        $this->deleteManagedCertificateIfPresent($company, $previousStoredLocation);

        $extension = strtolower($file->getClientOriginalExtension() ?: $file->guessExtension() ?: 'pfx');
        $relativeDirectory = CompanyPrivateStorageLayout::siiIntegrationCertificateDirectory((string) $company->id);
        $disk = Storage::disk('local');
        $disk->makeDirectory($relativeDirectory);
        $fileName = 'certificate.'.$extension;
        $disk->putFileAs($relativeDirectory, $file, $fileName);

        $absolutePath = $disk->path($relativeDirectory.'/'.$fileName);

        return 'file://'.$absolutePath;
    }

    private function deleteManagedCertificateIfPresent(Company $company, ?string $stored): void
    {
        if ($stored === null || $stored === '') {
            return;
        }

        $path = str_starts_with($stored, 'file://') ? substr($stored, strlen('file://')) : $stored;
        $canonical = realpath($path);
        if ($canonical === false || ! is_file($canonical)) {
            return;
        }

        foreach (CompanyPrivateStorageLayout::managedSiiCertificateDirectoryCandidates((string) $company->id) as $relative) {
            $managedBase = Storage::disk('local')->path($relative);
            $managedRoot = realpath($managedBase);
            if ($managedRoot === false) {
                continue;
            }

            $prefix = $managedRoot.DIRECTORY_SEPARATOR;
            if (str_starts_with($canonical, $prefix)) {
                @unlink($canonical);

                return;
            }
        }
    }
}
