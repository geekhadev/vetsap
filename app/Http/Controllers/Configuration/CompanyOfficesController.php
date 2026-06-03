<?php

namespace App\Http\Controllers\Configuration;

use App\Actions\Configuration\CompanyOffices\CreateCompanyOfficeAction;
use App\Actions\Configuration\CompanyOffices\DeleteCompanyOfficeAction;
use App\Actions\Configuration\CompanyOffices\UpdateCompanyOfficeAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Configuration\CompanyOfficeStoreRequest;
use App\Http\Requests\Configuration\CompanyOfficeUpdateRequest;
use App\Models\Company;
use App\Models\CompanyOffice;
use App\Support\Configuration\CompanyEditRedirect;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class CompanyOfficesController extends Controller
{
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

        return CompanyEditRedirect::back($company);
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

        return CompanyEditRedirect::back($company);
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

        return CompanyEditRedirect::back($company);
    }
}
