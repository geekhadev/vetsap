<?php

namespace App\Http\Controllers\Configuration;

use App\Actions\Configuration\Companies\CreateCompanyAction;
use App\Actions\Configuration\Companies\DeleteCompanyAction;
use App\Actions\Configuration\Companies\ListCompaniesAction;
use App\Actions\Configuration\Companies\ResolveManagedCompanySiiCertificateDiskPathAction;
use App\Actions\Configuration\Companies\UpdateCompanyAction;
use App\Actions\Web\StoreClinicWebImageAction;
use App\Actions\Web\SyncClinicTextWebSettingsAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Configuration\CompaniesRequest;
use App\Http\Requests\Configuration\CompanyListRequest;
use App\Http\Requests\Web\StoreClinicWebLogoRequest;
use App\Http\Requests\Web\UpdateClinicWebSettingsRequest;
use App\Models\Company;
use App\Models\Shared\SiiEconomicActivity;
use App\Support\Configuration\CompanyEditRedirect;
use App\Support\Integration\CompanySiiIntegrationSettingKeys;
use App\Support\Storage\PublicStorageUrl;
use App\Support\Web\ClinicWebSettingKeys;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CompaniesController extends Controller
{
    public function index(CompanyListRequest $request, ListCompaniesAction $action, DeleteCompanyAction $deleteCompanyAction): Response
    {
        $this->authorize('viewAny', Company::class);

        $user = $request->user();
        $selectedFromSession = data_get($request->session()->get('company_selected'), 'id');
        $sessionSelectedCompanyId = is_string($selectedFromSession) ? $selectedFromSession : null;

        $companies = $action->execute($user)->map(function (Company $company) use ($user, $deleteCompanyAction, $sessionSelectedCompanyId): array {
            $ownerUser = $company->owner();

            return [
                'id' => $company->id,
                'document_type' => $company->document_type->value,
                'document_number' => $company->document_number,
                'name' => $company->name,
                'alias' => $company->alias,
                'email' => $company->email,
                'phone' => $company->phone,
                'address' => $company->address,
                'owner' => $ownerUser ? [
                    'id' => $ownerUser->id,
                    'name' => $ownerUser->name,
                    'email' => $ownerUser->email,
                ] : null,
                'can' => [
                    'update' => $user->can('update', $company),
                    'delete' => $user->can('delete', $company)
                        && $deleteCompanyAction->deletionBlockedReason($user, $sessionSelectedCompanyId, $company) === null,
                ],
            ];
        })->values()->all();

        return Inertia::render('configuration/companies/index', [
            'companies' => $companies,
            'can' => [
                'create' => $user->can('create', Company::class),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Company::class);

        return Inertia::render('configuration/companies/form', [
            'company' => null,
            'siiIntegration' => $this->emptySiiIntegrationFormProps(),
            'siiCertificateDownloadUrl' => null,
            'can' => [
                'delete' => false,
            ],
        ]);
    }

    public function store(CompaniesRequest $request, CreateCompanyAction $action): RedirectResponse
    {
        $company = $action->execute($request->user(), $request->companyPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Empresa creada.']);

        return to_route('configuration.companies.edit', $company);
    }

    public function edit(Request $request, Company $company, DeleteCompanyAction $deleteCompanyAction): Response
    {
        $this->authorize('update', $company);

        $user = $request->user();
        $sessionSelectedCompanyId = data_get($request->session()->get('company_selected'), 'id');
        $sessionSelectedCompanyId = is_string($sessionSelectedCompanyId) ? $sessionSelectedCompanyId : null;

        return Inertia::render('configuration/companies/form', [
            'company' => $this->companyFormProps($company),
            'siiIntegration' => $this->siiIntegrationFormProps($company),
            'siiEconomicActivities' => SiiEconomicActivity::query()
                ->orderBy('code')
                ->get(['id', 'code', 'description']),
            'siiCertificateDownloadUrl' => $this->siiCertificateDownloadUrl($company),
            'can' => [
                'delete' => $user->can('delete', $company)
                    && $deleteCompanyAction->deletionBlockedReason($user, $sessionSelectedCompanyId, $company) === null,
            ],
        ]);
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

    public function updateWebSettings(UpdateClinicWebSettingsRequest $request, Company $company, SyncClinicTextWebSettingsAction $action): RedirectResponse
    {
        $company->update(['slug' => $request->validated('slug')]);

        $action->execute($company, $request->settingsPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Configuración del sitio web actualizada.']);

        return CompanyEditRedirect::back($company);
    }

    public function storeWebLogo(StoreClinicWebLogoRequest $request, Company $company, StoreClinicWebImageAction $action): RedirectResponse
    {
        /** @var UploadedFile $file */
        $file = $request->file('logo');
        $action->execute($company, ClinicWebSettingKeys::LOGO, $file);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Logo actualizado.']);

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
            'slug' => $company->slug,
            'webSettings' => $this->webSettingsFormProps($company),
        ];
    }

    /**
     * @return array<string, string|null>
     */
    private function webSettingsFormProps(Company $company): array
    {
        $keys = ClinicWebSettingKeys::PANEL_TEXT_KEYS;
        $values = $company->webSettings()
            ->whereIn('key', $keys)
            ->pluck('value', 'key');

        $result = [];
        foreach ($keys as $key) {
            $result[$key] = $values[$key] ?? null;
        }

        // Resolve logo URL if present
        $logoSetting = $company->webSettings()->where('key', ClinicWebSettingKeys::LOGO)->first();
        $result[ClinicWebSettingKeys::LOGO] = PublicStorageUrl::fromRelativePath($logoSetting?->value);

        return $result;
    }

    /**
     * @return array<string, string>
     */
    private function emptySiiIntegrationFormProps(): array
    {
        /** @var array<string, string> */
        return array_fill_keys(CompanySiiIntegrationSettingKeys::all(), '');
    }

    /**
     * @return array<string, string>
     */
    private function siiIntegrationFormProps(Company $company): array
    {
        $keys = CompanySiiIntegrationSettingKeys::all();
        $values = $company->integrationSettings()
            ->whereIn('key', $keys)
            ->pluck('value', 'key');

        $props = [];
        foreach ($keys as $key) {
            $props[$key] = (string) ($values[$key] ?? '');
        }

        return $props;
    }

    private function siiCertificateDownloadUrl(Company $company): ?string
    {
        if (app(ResolveManagedCompanySiiCertificateDiskPathAction::class)->execute($company) === null) {
            return null;
        }

        return route('configuration.companies.integrations.sii.certificate.download', $company);
    }
}
