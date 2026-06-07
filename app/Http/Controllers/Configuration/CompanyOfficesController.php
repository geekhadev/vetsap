<?php

namespace App\Http\Controllers\Configuration;

use App\Actions\Configuration\CompanyOffices\BuildCompanyOfficesPageDataAction;
use App\Actions\Configuration\CompanyOffices\CreateCompanyOfficeAction;
use App\Actions\Configuration\CompanyOffices\DeleteCompanyOfficeAction;
use App\Actions\Configuration\CompanyOffices\UpdateCompanyOfficeAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Configuration\CompanyOfficeStoreRequest;
use App\Http\Requests\Configuration\CompanyOfficeUpdateRequest;
use App\Models\Company;
use App\Models\CompanyOffice;
use App\Support\SelectedCompanySession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CompanyOfficesController extends Controller
{
    public function index(
        Request $request,
        BuildCompanyOfficesPageDataAction $buildPageData,
    ): Response {
        $this->authorize('viewAny', CompanyOffice::class);

        $companyId = SelectedCompanySession::selectedCompanyId($request);
        $company = $companyId !== null
            ? Company::query()->find($companyId)
            : null;

        if (! $company instanceof Company) {
            return Inertia::render('configuration/company-offices/index', [
                'companyMissing' => true,
                'companyId' => null,
                'offices' => [],
                'can' => [
                    'create' => false,
                ],
            ]);
        }

        $pageData = $buildPageData->execute($company, $request->user());

        return Inertia::render('configuration/company-offices/index', [
            'companyMissing' => false,
            'companyId' => $company->id,
            'offices' => $pageData['offices'],
            'can' => $pageData['can'],
        ]);
    }

    public function store(
        CompanyOfficeStoreRequest $request,
        Company $company,
        CreateCompanyOfficeAction $action,
    ): RedirectResponse {
        $validated = $request->validated();

        $action->execute($company, [
            'name' => $validated['name'],
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Sucursal creada.']);

        return to_route('configuration.company-offices.index');
    }

    public function update(
        CompanyOfficeUpdateRequest $request,
        Company $company,
        CompanyOffice $office,
        UpdateCompanyOfficeAction $action,
    ): RedirectResponse {
        $validated = $request->validated();

        $action->execute($office, [
            'name' => $validated['name'],
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Sucursal actualizada.']);

        return to_route('configuration.company-offices.index');
    }

    public function destroy(
        Company $company,
        CompanyOffice $office,
        DeleteCompanyOfficeAction $action,
    ): RedirectResponse {
        $this->authorize('delete', $office);

        abort_unless($office->company_id === $company->id, 404);

        $action->execute($office);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Sucursal eliminada.']);

        return to_route('configuration.company-offices.index');
    }
}
