<?php

namespace App\Http\Controllers\Configuration;

use App\Actions\Configuration\IntegrationsSettings\BuildIntegrationsSettingsPageDataAction;
use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use App\Support\Administration\ModulePermissionSlugs;
use App\Support\Administration\UserHasCompanyPermission;
use App\Support\SelectedCompanySession;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IntegrationsSettingsController extends Controller
{
    public function index(
        Request $request,
        BuildIntegrationsSettingsPageDataAction $buildPageData,
    ): Response {
        $user = $request->user();
        abort_unless(
            $user instanceof User
            && UserHasCompanyPermission::check(
                $user,
                ModulePermissionSlugs::for('configuration.integration-settings')->list(),
            ),
            403,
        );

        $companyId = SelectedCompanySession::selectedCompanyId($request);
        $company = $companyId !== null
            ? Company::query()->find($companyId)
            : null;

        if (! $company instanceof Company) {
            return Inertia::render('configuration/integration-settings/index', [
                'companyMissing' => true,
                'companyId' => null,
                'siiIntegration' => null,
                'siiEconomicActivities' => [],
                'siiCertificateDownloadUrl' => null,
            ]);
        }

        $pageData = $buildPageData->execute($company);

        return Inertia::render('configuration/integration-settings/index', [
            'companyMissing' => false,
            'companyId' => $pageData['companyId'],
            'siiIntegration' => $pageData['siiIntegration'],
            'siiEconomicActivities' => $pageData['siiEconomicActivities'],
            'siiCertificateDownloadUrl' => $pageData['siiCertificateDownloadUrl'],
        ]);
    }
}
