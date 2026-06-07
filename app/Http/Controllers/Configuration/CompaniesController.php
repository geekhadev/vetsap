<?php

namespace App\Http\Controllers\Configuration;

use App\Actions\Configuration\Companies\CreateCompanyAction;
use App\Actions\Configuration\Companies\DeleteCompanyAction;
use App\Actions\Configuration\Companies\SetSelectedCompanyAction;
use App\Actions\Configuration\Companies\UpdateCompanyAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Configuration\CompaniesRequest;
use App\Models\Company;
use App\Support\Configuration\CompanyEditRedirect;
use App\Support\SelectedCompanySession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CompaniesController extends Controller
{
    public function index(Request $request, DeleteCompanyAction $deleteCompanyAction): Response
    {
        $this->authorize('viewAny', Company::class);

        $companyId = SelectedCompanySession::selectedCompanyId($request);
        $company = $companyId !== null
            ? Company::query()->find($companyId)
            : null;

        if (! $company instanceof Company) {
            return Inertia::render('configuration/companies/form', [
                'company' => null,
                'companyMissing' => true,
                'can' => [
                    'delete' => false,
                ],
            ]);
        }

        $this->authorize('update', $company);

        return $this->companyFormResponse($request, $company, $deleteCompanyAction);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Company::class);

        return Inertia::render('configuration/companies/form', [
            'company' => null,
            'can' => [
                'delete' => false,
            ],
        ]);
    }

    public function store(
        CompaniesRequest $request,
        CreateCompanyAction $action,
        SetSelectedCompanyAction $setSelected,
    ): RedirectResponse {
        $company = $action->execute($request->user(), $request->companyPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Empresa creada.']);

        if ($request->boolean('select_after_create')) {
            $setSelected->execute($request, $request->user(), $company);

            return back();
        }

        return to_route('configuration.companies.index');
    }

    public function edit(Request $request, Company $company): RedirectResponse
    {
        $this->authorize('update', $company);

        return to_route('configuration.companies.index');
    }

    public function update(CompaniesRequest $request, Company $company, UpdateCompanyAction $action): RedirectResponse
    {
        $action->execute($company, $request->companyPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Empresa actualizada.']);

        return CompanyEditRedirect::back($company);
    }

    public function updateSlug(Request $request, Company $company): RedirectResponse
    {
        $this->authorize('update', $company);

        $validated = $request->validate([
            'slug' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9-]+$/',
                Rule::unique('configuration_companies', 'slug')->ignore($company->id),
            ],
        ]);

        $company->update(['slug' => $validated['slug']]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Slug actualizado.']);

        return CompanyEditRedirect::back($company);
    }

    public function destroy(Request $request, Company $company, DeleteCompanyAction $action): RedirectResponse
    {
        $this->authorize('delete', $company);

        $user = $request->user();
        $sessionSelectedCompanyId = data_get($request->session()->get('company_selected'), 'id');
        $sessionSelectedCompanyId = is_string($sessionSelectedCompanyId) ? $sessionSelectedCompanyId : null;

        $errorMessage = $action->execute($user, $sessionSelectedCompanyId, $company);

        if ($errorMessage !== null) {
            Inertia::flash('toast', ['type' => 'error', 'message' => $errorMessage]);

            return back();
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Empresa eliminada.']);

        return to_route('configuration.companies.index');
    }

    private function companyFormResponse(
        Request $request,
        Company $company,
        DeleteCompanyAction $deleteCompanyAction,
    ): Response {
        $user = $request->user();
        $sessionSelectedCompanyId = data_get($request->session()->get('company_selected'), 'id');
        $sessionSelectedCompanyId = is_string($sessionSelectedCompanyId) ? $sessionSelectedCompanyId : null;

        return Inertia::render('configuration/companies/form', [
            'company' => $this->companyFormProps($company),
            'can' => [
                'delete' => $user->can('delete', $company)
                    && $deleteCompanyAction->deletionBlockedReason($user, $sessionSelectedCompanyId, $company) === null,
            ],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function companyFormProps(Company $company): array
    {
        return [
            'id' => $company->id,
            'document_type' => $company->document_type->value,
            'document_number' => $company->document_number,
            'name' => $company->name,
            'alias' => $company->alias,
            'email' => $company->email,
            'phone' => $company->phone,
            'address' => $company->address,
        ];
    }
}
