<?php

namespace App\Http\Controllers\Medic;

use App\Actions\Medic\Patients\CreatePatientAction;
use App\Actions\Medic\Patients\DeletePatientAction;
use App\Actions\Medic\Patients\ListPatientsForCompanyAction;
use App\Actions\Medic\Patients\UpdatePatientAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Medic\PatientListRequest;
use App\Http\Requests\Medic\PatientStoreRequest;
use App\Http\Requests\Medic\PatientUpdateRequest;
use App\Models\Company;
use App\Models\Medic\Patient;
use App\Models\Medic\Species;
use App\Models\Sale\Customer;
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

    public function edit(Patient $patient): RedirectResponse
    {
        $this->authorize('update', $patient);

        return to_route('medic.patients.index');
    }

    public function update(
        PatientUpdateRequest $request,
        Patient $patient,
        UpdatePatientAction $action,
    ): RedirectResponse {
        $this->authorize('update', $patient);

        $action->execute($patient, $request->patientPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Paciente actualizado correctamente.']);

        return $this->redirectAfterSave($request->redirectTarget());
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
