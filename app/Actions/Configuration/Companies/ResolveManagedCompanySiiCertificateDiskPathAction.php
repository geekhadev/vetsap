<?php

namespace App\Actions\Configuration\Companies;

use App\Models\Company;
use App\Models\CompanyIntegrationSetting;
use App\Support\Integration\CompanySiiIntegrationSettingKeys;
use App\Support\Storage\CompanyPrivateStorageLayout;
use Illuminate\Support\Facades\Storage;

final class ResolveManagedCompanySiiCertificateDiskPathAction
{
    /**
     * Resuelve la ruta absoluta en disco del certificado SII solo si está almacenado bajo el directorio
     * administrado por la aplicación para la empresa (subidas vía integración SII).
     */
    public function execute(Company $company): ?string
    {
        $stored = CompanyIntegrationSetting::query()
            ->where('company_id', $company->id)
            ->where('key', CompanySiiIntegrationSettingKeys::CERTIFICATE_URL)
            ->value('value');

        if ($stored === null || $stored === '') {
            return null;
        }

        $raw = (string) $stored;
        $path = str_starts_with($raw, 'file://') ? substr($raw, strlen('file://')) : $raw;

        $canonical = realpath($path);
        if ($canonical === false || ! is_file($canonical) || ! is_readable($canonical)) {
            return null;
        }

        foreach (CompanyPrivateStorageLayout::managedSiiCertificateDirectoryCandidates((string) $company->id) as $relative) {
            $managedBase = Storage::disk('local')->path($relative);
            $managedRoot = realpath($managedBase);
            if ($managedRoot === false) {
                continue;
            }

            $prefix = $managedRoot.DIRECTORY_SEPARATOR;
            if (str_starts_with($canonical, $prefix)) {
                return $canonical;
            }
        }

        return null;
    }
}
