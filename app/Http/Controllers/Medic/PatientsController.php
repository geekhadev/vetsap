<?php

namespace App\Http\Controllers\Medic;

use App\Actions\Medic\ClinicalAttentions\ClosePatientDraftAttentionAction;
use App\Actions\Medic\ClinicalAttentions\UpsertPatientDraftAttentionAction;
use App\Actions\Medic\Patients\CreatePatientAction;
use App\Actions\Medic\Patients\DeletePatientAction;
use App\Actions\Medic\Patients\ListPatientsForCompanyAction;
use App\Actions\Medic\Patients\UpdatePatientAction;
use App\Enums\Medic\ClinicalAttentionStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Medic\PatientDraftAttentionCloseRequest;
use App\Http\Requests\Medic\PatientDraftAttentionUpsertRequest;
use App\Http\Requests\Medic\PatientListRequest;
use App\Http\Requests\Medic\PatientStoreRequest;
use App\Http\Requests\Medic\PatientUpdateRequest;
use App\Models\Company;
use App\Models\Medic\ClinicalAttention;
use App\Models\Medic\ClinicalTemplate;
use App\Models\Medic\Doctor;
use App\Models\Medic\Patient;
use App\Models\Medic\Species;
use App\Models\Sale\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class PatientsController extends Controller
{
    public function index(
        PatientListRequest $request,
        ListPatientsForCompanyAction $list,
    ): Response {
        $this->authorize('viewAny', Patient::class);

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

        return Inertia::render('medic/patients/index', [
            'data' => $data,
            'filters' => $request->filtersForFrontend(),
            'species' => $company instanceof Company
                ? Species::query()
                    ->forCompany($company->id)
                    ->where('is_active', true)
                    ->orderBy('name')
                    ->get(['id', 'name'])
                : [],
            'customers' => $company instanceof Company
                ? Customer::query()
                    ->forCompany($company->id)
                    ->orderBy('name')
                    ->get(['id', 'name', 'document_type', 'document_number'])
                : [],
            'can' => [
                'create' => $user?->can('create', Patient::class) ?? false,
                'update' => $user?->can('updateAny', Patient::class) ?? false,
                'delete' => $user?->can('deleteAny', Patient::class) ?? false,
            ],
        ]);
    }

    public function create(): RedirectResponse
    {
        $this->authorize('create', Patient::class);

        return to_route('medic.patients.index');
    }

    public function store(PatientStoreRequest $request, CreatePatientAction $action): RedirectResponse
    {
        $this->authorize('create', Patient::class);

        $company = $request->selectedCompany();
        if (! $company instanceof Company) {
            return back()->withErrors(['name' => 'Debes seleccionar una empresa para crear pacientes.']);
        }

        $action->execute($request->patientPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Paciente creado correctamente.']);

        return $this->redirectAfterSave($request->redirectTarget());
    }

    public function edit(Patient $patient, Request $request): Response
    {
        $this->authorize('update', $patient);

        $company = $this->resolveCompany($request);
        $patient->load([
            'species:id,name',
            'customer:id,name,document_type,document_number,email,phone,address',
        ]);

        $user = $request->user();

        $activeTab = in_array($request->query('tab'), ['historial', 'examenes', 'nueva-atencion'], true)
            ? $request->query('tab')
            : 'historial';

        $draftAttention = ClinicalAttention::query()
            ->where('patient_id', $patient->id)
            ->draft()
            ->with(['values', 'template.fields'])
            ->first();

        if (! $request->has('tab') && $draftAttention instanceof ClinicalAttention) {
            $activeTab = 'nueva-atencion';
        }

        $attentions = ClinicalAttention::query()
            ->where('patient_id', $patient->id)
            ->closed()
            ->with(['template:id,name', 'doctor:id,first_name,last_name'])
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('medic/patients/edit', [
            'patient' => $patient,
            'redirectTo' => $request->query('redirect_to') === 'customers' ? 'customers' : 'patients',
            'activeTab' => $activeTab,
            'draftAttention' => $draftAttention,
            'species' => $company instanceof Company
                ? Species::query()
                    ->forCompany($company->id)
                    ->where('is_active', true)
                    ->orderBy('name')
                    ->get(['id', 'name'])
                : [],
            'customers' => $company instanceof Company
                ? Customer::query()
                    ->forCompany($company->id)
                    ->orderBy('name')
                    ->get(['id', 'name', 'document_type', 'document_number', 'email', 'phone', 'address'])
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
            'doctors' => $company instanceof Company
                ? Doctor::query()
                    ->forCompany($company->id)
                    ->where('is_active', true)
                    ->orderBy('first_name')
                    ->get(['id', 'first_name', 'last_name'])
                : [],
            'attentions' => $attentions->map(fn ($a) => [
                'id' => $a->id,
                'template_name' => $a->template?->name,
                'doctor_name' => $a->doctor
                    ? "{$a->doctor->first_name} {$a->doctor->last_name}"
                    : null,
                'created_at' => $a->created_at,
            ]),
            'can' => [
                'attentions' => [
                    'create' => $user?->can('create', ClinicalAttention::class) ?? false,
                    'delete' => $user?->can('deleteAny', ClinicalAttention::class) ?? false,
                ],
            ],
        ]);
    }

    public function upsertDraftAttention(
        PatientDraftAttentionUpsertRequest $request,
        Patient $patient,
        UpsertPatientDraftAttentionAction $action,
    ): JsonResponse {
        $this->authorize('update', $patient);
        $this->authorize('create', ClinicalAttention::class);

        $company = $request->selectedCompany();
        if (! $company instanceof Company) {
            abort(422, 'Debes seleccionar una empresa.');
        }

        if ($patient->company_id !== $company->id) {
            abort(404);
        }

        try {
            $draft = $action->execute(
                $patient,
                $company->id,
                $request->draftPayload(),
                $request->user()?->id,
            );
        } catch (\RuntimeException $exception) {
            abort(422, $exception->getMessage());
        }

        return response()->json($draft);
    }

    public function closeDraftAttention(
        PatientDraftAttentionCloseRequest $request,
        Patient $patient,
        ClosePatientDraftAttentionAction $action,
    ): RedirectResponse {
        $this->authorize('update', $patient);

        $company = $request->selectedCompany();
        if (! $company instanceof Company) {
            return back()->withErrors(['template_id' => 'Debes seleccionar una empresa.']);
        }

        if ($patient->company_id !== $company->id) {
            abort(404);
        }

        $draft = ClinicalAttention::query()
            ->where('patient_id', $patient->id)
            ->where('status', ClinicalAttentionStatus::Draft)
            ->first();

        if (! $draft instanceof ClinicalAttention) {
            return back()->withErrors(['template_id' => 'No hay una atención en borrador para cerrar.']);
        }

        $this->authorize('update', $draft);

        $action->execute($draft, $request->closePayload($patient->id));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Atención cerrada correctamente.']);

        return redirect(route('medic.patients.edit', [
            'patient' => $patient->id,
            'tab' => 'historial',
        ]));
    }

    public function update(
        PatientUpdateRequest $request,
        Patient $patient,
        UpdatePatientAction $action,
    ): RedirectResponse {
        $this->authorize('update', $patient);

        $action->execute($patient, $request->patientPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Paciente actualizado correctamente.']);

        if ($request->redirectTarget() === 'customers') {
            return to_route('sale.customers.index');
        }

        return to_route('medic.patients.edit', $patient);
    }

    public function destroy(Patient $patient, DeletePatientAction $action, Request $request): RedirectResponse
    {
        $this->authorize('delete', $patient);

        $action->execute($patient);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Paciente eliminado.']);

        $target = $request->input('redirect_to') === 'customers' ? 'customers' : 'patients';

        return $this->redirectAfterSave($target);
    }

    protected function redirectAfterSave(string $target): RedirectResponse
    {
        if ($target === 'customers') {
            return to_route('sale.customers.index');
        }

        return to_route('medic.patients.index');
    }
}
