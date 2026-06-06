<?php

namespace App\Http\Controllers\Medic;

use App\Actions\Medic\Doctors\CreateDoctorAction;
use App\Actions\Medic\Doctors\DeleteDoctorAction;
use App\Actions\Medic\Doctors\ListDoctorsForCompanyAction;
use App\Actions\Medic\Doctors\SyncDoctorServicesAction;
use App\Actions\Medic\Doctors\UpdateDoctorAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Medic\DoctorListRequest;
use App\Http\Requests\Medic\DoctorStoreRequest;
use App\Http\Requests\Medic\DoctorSyncServicesRequest;
use App\Http\Requests\Medic\DoctorUpdateRequest;
use App\Models\Company;
use App\Models\Medic\Doctor;
use App\Models\Medic\Service;
use Illuminate\Http\RedirectResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class DoctorsController extends Controller
{
    public function index(
        DoctorListRequest $request,
        ListDoctorsForCompanyAction $list,
    ): Response {
        $this->authorize('viewAny', Doctor::class);

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

        return Inertia::render('medic/doctors/index', [
            'data' => $data,
            'filters' => $request->filtersForFrontend(),
            'services' => $company instanceof Company
                ? Service::query()
                    ->forCompany($company->id)
                    ->where('is_active', true)
                    ->orderBy('name')
                    ->get(['id', 'name', 'duration_minutes', 'specialty_id'])
                : [],
            'can' => [
                'create' => $user?->can('create', Doctor::class) ?? false,
                'update' => $user?->can('updateAny', Doctor::class) ?? false,
                'delete' => $user?->can('deleteAny', Doctor::class) ?? false,
            ],
        ]);
    }

    public function create(): RedirectResponse
    {
        $this->authorize('create', Doctor::class);

        return to_route('medic.doctors.index');
    }

    public function store(DoctorStoreRequest $request, CreateDoctorAction $action): RedirectResponse
    {
        $this->authorize('create', Doctor::class);

        $company = $request->selectedCompany();
        if (! $company instanceof Company) {
            return back()->withErrors(['first_name' => 'Debes seleccionar una empresa para crear doctores.']);
        }

        $action->execute($request->doctorPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Doctor creado correctamente.']);

        return to_route('medic.doctors.index');
    }

    public function edit(Doctor $doctor): RedirectResponse
    {
        $this->authorize('update', $doctor);

        return to_route('medic.doctors.index');
    }

    public function update(
        DoctorUpdateRequest $request,
        Doctor $doctor,
        UpdateDoctorAction $action,
    ): RedirectResponse {
        $this->authorize('update', $doctor);

        $services = $request->hasServicesPayload() ? $request->servicesPayload() : null;

        $action->execute($doctor, $request->doctorPayload(), $services);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Doctor actualizado correctamente.']);

        return to_route('medic.doctors.index');
    }

    public function syncServices(
        DoctorSyncServicesRequest $request,
        Doctor $doctor,
        SyncDoctorServicesAction $action,
    ): RedirectResponse {
        $this->authorize('update', $doctor);

        $action->execute($doctor, $request->servicesPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Servicios del doctor actualizados.']);

        return to_route('medic.doctors.index');
    }

    public function destroy(Doctor $doctor, DeleteDoctorAction $action): RedirectResponse
    {
        $this->authorize('delete', $doctor);

        $action->execute($doctor);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Doctor eliminado.']);

        return to_route('medic.doctors.index');
    }
}
