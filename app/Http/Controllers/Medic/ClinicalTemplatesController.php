<?php

namespace App\Http\Controllers\Medic;

use App\Actions\Medic\ClinicalTemplates\CreateClinicalTemplateAction;
use App\Actions\Medic\ClinicalTemplates\DeleteClinicalTemplateAction;
use App\Actions\Medic\ClinicalTemplates\ListClinicalTemplatesForCompanyAction;
use App\Actions\Medic\ClinicalTemplates\UpdateClinicalTemplateAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Medic\ClinicalTemplateListRequest;
use App\Http\Requests\Medic\ClinicalTemplateStoreRequest;
use App\Http\Requests\Medic\ClinicalTemplateUpdateRequest;
use App\Models\Company;
use App\Models\Medic\ClinicalTemplate;
use App\Models\Medic\Species;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class ClinicalTemplatesController extends Controller
{
    public function index(
        ClinicalTemplateListRequest $request,
        ListClinicalTemplatesForCompanyAction $list,
    ): Response {
        $this->authorize('viewAny', ClinicalTemplate::class);

        $company = $this->resolveCompany($request);
        $filters = $request->filtersForAction();
        $perPage = (int) ($filters['per_page'] ?? 20);

        $data = $company instanceof Company
            ? $list->execute($company->id, $filters)
            : new LengthAwarePaginator([], 0, max(1, $perPage), 1, [
                'path' => $request->url(),
                'query' => $request->query(),
            ]);

        $user = $request->user();

        return Inertia::render('medic/clinical-templates/index', [
            'data' => $data,
            'filters' => $request->filtersForFrontend(),
            'species' => $company instanceof Company
                ? Species::query()
                    ->forCompany($company->id)
                    ->where('is_active', true)
                    ->orderBy('name')
                    ->get(['id', 'name'])
                : [],
            'can' => [
                'create' => $user?->can('create', ClinicalTemplate::class) ?? false,
                'update' => $user?->can('updateAny', ClinicalTemplate::class) ?? false,
                'delete' => $user?->can('deleteAny', ClinicalTemplate::class) ?? false,
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', ClinicalTemplate::class);

        $company = $this->resolveCompany($request);

        return Inertia::render('medic/clinical-templates/create', [
            'species' => $company instanceof Company
                ? Species::query()
                    ->forCompany($company->id)
                    ->where('is_active', true)
                    ->orderBy('name')
                    ->get(['id', 'name'])
                : [],
        ]);
    }

    public function store(
        ClinicalTemplateStoreRequest $request,
        CreateClinicalTemplateAction $action,
    ): RedirectResponse {
        $this->authorize('create', ClinicalTemplate::class);

        $company = $request->selectedCompany();
        if (! $company instanceof Company) {
            return back()->withErrors(['name' => 'Debes seleccionar una empresa para crear plantillas.']);
        }

        $action->execute($request->templatePayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Plantilla creada correctamente.']);

        return to_route('medic.clinical-templates.index');
    }

    public function edit(ClinicalTemplate $clinicalTemplate, Request $request): Response
    {
        $this->authorize('update', $clinicalTemplate);

        $company = $this->resolveCompany($request);

        return Inertia::render('medic/clinical-templates/edit', [
            'template' => $clinicalTemplate->load(['fields', 'species:id,name']),
            'species' => $company instanceof Company
                ? Species::query()
                    ->forCompany($company->id)
                    ->where('is_active', true)
                    ->orderBy('name')
                    ->get(['id', 'name'])
                : [],
        ]);
    }

    public function update(
        ClinicalTemplateUpdateRequest $request,
        ClinicalTemplate $clinicalTemplate,
        UpdateClinicalTemplateAction $action,
    ): RedirectResponse {
        $this->authorize('update', $clinicalTemplate);

        $action->execute($clinicalTemplate, $request->templatePayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Plantilla actualizada correctamente.']);

        return to_route('medic.clinical-templates.index');
    }

    public function destroy(
        ClinicalTemplate $clinicalTemplate,
        DeleteClinicalTemplateAction $action,
    ): RedirectResponse {
        $this->authorize('delete', $clinicalTemplate);

        $action->execute($clinicalTemplate);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Plantilla eliminada.']);

        return to_route('medic.clinical-templates.index');
    }
}
