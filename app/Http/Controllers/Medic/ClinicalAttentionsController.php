<?php

namespace App\Http\Controllers\Medic;

use App\Actions\Medic\ClinicalAttentions\CreateClinicalAttentionAction;
use App\Actions\Medic\ClinicalAttentions\DeleteClinicalAttentionAction;
use App\Actions\Medic\ClinicalAttentions\ListClinicalAttentionsForCompanyAction;
use App\Actions\Medic\ClinicalAttentions\UpdateClinicalAttentionAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Medic\ClinicalAttentionListRequest;
use App\Http\Requests\Medic\ClinicalAttentionStoreRequest;
use App\Http\Requests\Medic\ClinicalAttentionUpdateRequest;
use App\Models\Company;
use App\Models\Medic\ClinicalAttention;
use App\Models\Medic\ClinicalTemplate;
use App\Models\Medic\Doctor;
use App\Models\Medic\Patient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class ClinicalAttentionsController extends Controller
{
    public function index(
        ClinicalAttentionListRequest $request,
        ListClinicalAttentionsForCompanyAction $list,
    ): Response {
        $this->authorize('viewAny', ClinicalAttention::class);

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

        return Inertia::render('medic/clinical-attentions/index', [
            'data' => $data,
            'filters' => $request->filtersForFrontend(),
            'patients' => $company instanceof Company
                ? Patient::query()
                    ->forCompany($company->id)
                    ->where('is_active', true)
                    ->orderBy('name')
                    ->get(['id', 'name', 'record_number'])
                : [],
            'doctors' => $company instanceof Company
                ? Doctor::query()
                    ->forCompany($company->id)
                    ->where('is_active', true)
                    ->orderBy('first_name')
                    ->get(['id', 'first_name', 'last_name'])
                : [],
            'templates' => $company instanceof Company
                ? ClinicalTemplate::query()
                    ->forCompany($company->id)
                    ->where('is_active', true)
                    ->orderByDesc('is_default')
                    ->orderBy('name')
                    ->with('fields')
                    ->get(['id', 'name', 'is_default'])
                : [],
            'can' => [
                'create' => $user?->can('create', ClinicalAttention::class) ?? false,
                'update' => $user?->can('updateAny', ClinicalAttention::class) ?? false,
                'delete' => $user?->can('deleteAny', ClinicalAttention::class) ?? false,
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', ClinicalAttention::class);

        $company = $this->resolveCompany($request);

        return Inertia::render('medic/clinical-attentions/create', [
            'patients' => $company instanceof Company
                ? Patient::query()
                    ->forCompany($company->id)
                    ->where('is_active', true)
                    ->with(['species:id,name', 'customer:id,name,phone,email'])
                    ->orderBy('name')
                    ->get(['id', 'name', 'record_number', 'sex', 'weight_kg', 'colors', 'breed', 'species_id', 'customer_id'])
                    ->map(fn ($p) => [
                        'id' => $p->id,
                        'name' => $p->name,
                        'record_number' => $p->record_number,
                        'sex' => $p->sex?->value,
                        'weight_kg' => $p->weight_kg,
                        'colors' => $p->colors,
                        'breed' => $p->breed,
                        'species_name' => $p->species?->name,
                        'customer_name' => $p->customer?->name,
                        'customer_phone' => $p->customer?->phone,
                        'customer_email' => $p->customer?->email,
                    ])
                : [],
            'doctors' => $company instanceof Company
                ? Doctor::query()
                    ->forCompany($company->id)
                    ->where('is_active', true)
                    ->orderBy('first_name')
                    ->get(['id', 'first_name', 'last_name'])
                : [],
            'templates' => $company instanceof Company
                ? ClinicalTemplate::query()
                    ->forCompany($company->id)
                    ->where('is_active', true)
                    ->orderByDesc('is_default')
                    ->orderBy('name')
                    ->with('fields')
                    ->get(['id', 'name', 'is_default'])
                : [],
        ]);
    }

    public function store(
        ClinicalAttentionStoreRequest $request,
        CreateClinicalAttentionAction $action,
    ): RedirectResponse {
        $this->authorize('create', ClinicalAttention::class);

        $company = $request->selectedCompany();
        if (! $company instanceof Company) {
            return back()->withErrors(['template_id' => 'Debes seleccionar una empresa para registrar atenciones.']);
        }

        $action->execute($request->attentionPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Atención registrada correctamente.']);

        return to_route('medic.clinical-attentions.index');
    }

    public function edit(ClinicalAttention $clinicalAttention, Request $request): Response
    {
        $this->authorize('update', $clinicalAttention);

        $company = $this->resolveCompany($request);

        return Inertia::render('medic/clinical-attentions/edit', [
            'attention' => $clinicalAttention->load('values'),
            'patients' => $company instanceof Company
                ? Patient::query()
                    ->forCompany($company->id)
                    ->where('is_active', true)
                    ->with(['species:id,name', 'customer:id,name,phone,email'])
                    ->orderBy('name')
                    ->get(['id', 'name', 'record_number', 'sex', 'weight_kg', 'colors', 'breed', 'species_id', 'customer_id'])
                    ->map(fn ($p) => [
                        'id' => $p->id,
                        'name' => $p->name,
                        'record_number' => $p->record_number,
                        'sex' => $p->sex?->value,
                        'weight_kg' => $p->weight_kg,
                        'colors' => $p->colors,
                        'breed' => $p->breed,
                        'species_name' => $p->species?->name,
                        'customer_name' => $p->customer?->name,
                        'customer_phone' => $p->customer?->phone,
                        'customer_email' => $p->customer?->email,
                    ])
                : [],
            'doctors' => $company instanceof Company
                ? Doctor::query()
                    ->forCompany($company->id)
                    ->where('is_active', true)
                    ->orderBy('first_name')
                    ->get(['id', 'first_name', 'last_name'])
                : [],
            'templates' => $company instanceof Company
                ? ClinicalTemplate::query()
                    ->forCompany($company->id)
                    ->where('is_active', true)
                    ->orderByDesc('is_default')
                    ->orderBy('name')
                    ->with('fields')
                    ->get(['id', 'name', 'is_default'])
                : [],
        ]);
    }

    public function update(
        ClinicalAttentionUpdateRequest $request,
        ClinicalAttention $clinicalAttention,
        UpdateClinicalAttentionAction $action,
    ): RedirectResponse {
        $this->authorize('update', $clinicalAttention);

        $action->execute($clinicalAttention, $request->attentionPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Atención actualizada correctamente.']);

        return to_route('medic.clinical-attentions.index');
    }

    public function destroy(
        ClinicalAttention $clinicalAttention,
        DeleteClinicalAttentionAction $action,
    ): RedirectResponse {
        $this->authorize('delete', $clinicalAttention);

        $action->execute($clinicalAttention);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Atención eliminada.']);

        return to_route('medic.clinical-attentions.index');
    }
}
