<?php

namespace App\Http\Controllers\Configuration;

use App\Actions\Configuration\Companies\ResolveManagedCompanySiiCertificateDiskPathAction;
use App\Actions\Configuration\Companies\StoreCompanySiiIntegrationCertificateFromUploadAction;
use App\Actions\Configuration\Companies\SyncCompanySiiIntegrationSettingsAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Configuration\CompanySiiIntegrationRequest;
use App\Models\Company;
use App\Models\CompanyIntegrationSetting;
use App\Support\Configuration\CompanyEditRedirect;
use App\Support\Integration\CompanySiiIntegrationSettingKeys;
use App\Support\Validation\CompanySiiIntegrationValidationRules;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class CompanySiiIntegrationController extends Controller
{
    public function download(
        Company $company,
        ResolveManagedCompanySiiCertificateDiskPathAction $resolvePath,
    ): BinaryFileResponse {
        $this->authorize('update', $company);

        $path = $resolvePath->execute($company);
        if ($path === null) {
            abort(404);
        }

        $extension = pathinfo($path, PATHINFO_EXTENSION);
        $suffix = ($extension !== '') ? strtolower($extension) : 'pfx';

        return response()->download($path, 'certificado-sii.'.$suffix);
    }

    public function update(
        CompanySiiIntegrationRequest $request,
        Company $company,
        SyncCompanySiiIntegrationSettingsAction $action,
        StoreCompanySiiIntegrationCertificateFromUploadAction $storeCertificate,
    ): RedirectResponse {
        $settings = $request->siiPayload();

        if ($request->hasFile(CompanySiiIntegrationValidationRules::CERTIFICATE_FILE_INPUT)) {
            $previous = CompanyIntegrationSetting::query()
                ->where('company_id', $company->id)
                ->where('key', CompanySiiIntegrationSettingKeys::CERTIFICATE_URL)
                ->value('value');

            $settings[CompanySiiIntegrationSettingKeys::CERTIFICATE_URL] = $storeCertificate->execute(
                $company,
                $request->file(CompanySiiIntegrationValidationRules::CERTIFICATE_FILE_INPUT),
                $previous !== null ? (string) $previous : null,
            );
        }

        $action->execute($company, $settings);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Integración SII guardada.']);

        return CompanyEditRedirect::back($company);
    }
}
