<?php

namespace App\Http\Controllers\Medic;

use App\Actions\Medic\ClinicalAttentions\CreateClinicalAttentionAction;
use App\Actions\Medic\ClinicalAttentions\DeleteClinicalAttentionAction;
use App\Actions\Medic\ClinicalAttentions\ListClinicalAttentionsForCompanyAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Medic\ClinicalAttentionListRequest;
use App\Http\Requests\Medic\ClinicalAttentionStoreRequest;
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
                'update' => false,
                'delete' => $user?->can('deleteAny', ClinicalAttention::class) ?? false,
            ],
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

        $backToPatient = $request->input('back_to_patient_id');

        if ($backToPatient) {
            return redirect(route('medic.patients.edit', [
                'patient' => $backToPatient,
                'tab' => 'historial',
            ]));
        }

        return to_route('medic.clinical-attentions.index');
    }

    public function destroy(
        ClinicalAttention $clinicalAttention,
        DeleteClinicalAttentionAction $action,
        Request $request,
    ): RedirectResponse {
        $this->authorize('delete', $clinicalAttention);

        $action->execute($clinicalAttention);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Atención eliminada.']);

        $backToPatient = $request->input('back_to_patient') ?? $request->query('back_to_patient');

        if (is_string($backToPatient) && $backToPatient !== '') {
            return redirect(route('medic.patients.edit', [
                'patient' => $backToPatient,
                'tab' => 'historial',
            ]));
        }

        return to_route('medic.clinical-attentions.index');
    }
}
