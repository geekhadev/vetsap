<?php

namespace App\Http\Controllers\Medic;

use App\Actions\Medic\Specialties\CreateSpecialtyAction;
use App\Actions\Medic\Specialties\DeleteSpecialtyAction;
use App\Actions\Medic\Specialties\ListSpecialtiesForCompanyAction;
use App\Actions\Medic\Specialties\UpdateSpecialtyAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Medic\SpecialtyListRequest;
use App\Http\Requests\Medic\SpecialtyStoreRequest;
use App\Http\Requests\Medic\SpecialtyUpdateRequest;
use App\Models\Company;
use App\Models\Medic\Specialty;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class SpecialtiesController extends Controller
{
    public function index(
        SpecialtyListRequest $request,
        ListSpecialtiesForCompanyAction $list,
    ): Response {
        $this->authorize('viewAny', Specialty::class);

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

        return Inertia::render('medic/specialties/index', [
            'data' => $data,
            'filters' => $request->filtersForFrontend(),
            'can' => [
                'create' => $user?->can('create', Specialty::class) ?? false,
                'update' => $user?->can('updateAny', Specialty::class) ?? false,
                'delete' => $user?->can('deleteAny', Specialty::class) ?? false,
            ],
        ]);
    }

    public function create(): RedirectResponse
    {
        $this->authorize('create', Specialty::class);

        return to_route('medic.specialties.index');
    }

    public function store(SpecialtyStoreRequest $request, CreateSpecialtyAction $action): RedirectResponse
    {
        $this->authorize('create', Specialty::class);

        $company = $request->selectedCompany();
        if (! $company instanceof Company) {
            return back()->withErrors(['name' => 'Debes seleccionar una empresa para crear especialidades.']);
        }

        $action->execute($request->specialtyPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Especialidad creada correctamente.']);

        return to_route('medic.specialties.index');
    }

    public function edit(Specialty $specialty): RedirectResponse
    {
        $this->authorize('update', $specialty);

        return to_route('medic.specialties.index');
    }

    public function update(
        SpecialtyUpdateRequest $request,
        Specialty $specialty,
        UpdateSpecialtyAction $action,
    ): RedirectResponse {
        $this->authorize('update', $specialty);

        $action->execute($specialty, $request->specialtyPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Especialidad actualizada correctamente.']);

        return to_route('medic.specialties.index');
    }

    public function destroy(Specialty $specialty, DeleteSpecialtyAction $action): RedirectResponse
    {
        $this->authorize('delete', $specialty);

        $action->execute($specialty);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Especialidad eliminada.']);

        return to_route('medic.specialties.index');
    }

    private function resolveCompany(Request $request): ?Company
    {
        $id = data_get($request->session()->get('company_selected'), 'id');

        if (! is_string($id) || $id === '') {
            return null;
        }

        return Company::query()->find($id);
    }
}
