<?php

namespace App\Http\Controllers\Configuration;

use App\Actions\Configuration\WebsiteSettings\BuildWebsiteSettingsPageDataAction;
use App\Actions\Web\StoreClinicWebImageAction;
use App\Actions\Web\SyncClinicTextWebSettingsAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Configuration\StoreWebsiteLogoRequest;
use App\Http\Requests\Configuration\UpdateWebsiteSettingsRequest;
use App\Models\Company;
use App\Support\SelectedCompanySession;
use App\Support\Web\ClinicWebSettingKeys;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;
use Inertia\Response;

class WebsiteSettingsController extends Controller
{
    public function index(
        Request $request,
        BuildWebsiteSettingsPageDataAction $buildPageData,
    ): Response {
        $companyId = SelectedCompanySession::selectedCompanyId($request);
        $company = $companyId !== null
            ? Company::query()->find($companyId)
            : null;

        if (! $company instanceof Company) {
            return Inertia::render('configuration/website-settings/index', [
                'companyMissing' => true,
                'companyId' => null,
                'slug' => null,
                'webSettings' => null,
            ]);
        }

        $pageData = $buildPageData->execute($company);

        return Inertia::render('configuration/website-settings/index', [
            'companyMissing' => false,
            'companyId' => $pageData['companyId'],
            'slug' => $pageData['slug'],
            'webSettings' => $pageData['webSettings'],
        ]);
    }

    public function update(
        UpdateWebsiteSettingsRequest $request,
        SyncClinicTextWebSettingsAction $action,
    ): RedirectResponse {
        $company = $request->selectedCompany();

        if (! $company instanceof Company) {
            return back()->withErrors([
                'slug' => 'Debes seleccionar una empresa para guardar la configuración.',
            ]);
        }

        $company->update(['slug' => $request->validated('slug')]);

        $action->execute($company, $request->settingsPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Configuración del sitio web actualizada.']);

        return to_route('configuration.website-settings.index');
    }

    public function storeLogo(
        StoreWebsiteLogoRequest $request,
        StoreClinicWebImageAction $action,
    ): RedirectResponse {
        $company = $request->selectedCompany();

        if (! $company instanceof Company) {
            return back()->withErrors([
                'logo' => 'Debes seleccionar una empresa para subir el logo.',
            ]);
        }

        /** @var UploadedFile $file */
        $file = $request->file('logo');
        $action->execute($company, ClinicWebSettingKeys::LOGO, $file);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Logo actualizado.']);

        return to_route('configuration.website-settings.index');
    }
}
