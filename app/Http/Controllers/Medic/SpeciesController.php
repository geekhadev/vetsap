<?php

namespace App\Http\Controllers\Medic;

use App\Actions\Medic\Species\CreateSpeciesAction;
use App\Actions\Medic\Species\DeleteSpeciesAction;
use App\Actions\Medic\Species\ListSpeciesForCompanyAction;
use App\Actions\Medic\Species\UpdateSpeciesAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Medic\SpeciesListRequest;
use App\Http\Requests\Medic\SpeciesStoreRequest;
use App\Http\Requests\Medic\SpeciesUpdateRequest;
use App\Models\Company;
use App\Models\Medic\Species;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class SpeciesController extends Controller
{
    public function index(
        SpeciesListRequest $request,
        ListSpeciesForCompanyAction $list,
    ): Response {
        $this->authorize('viewAny', Species::class);

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

        return Inertia::render('medic/species/index', [
            'data' => $data,
            'filters' => $request->filtersForFrontend(),
            'can' => [
                'create' => $user?->can('create', Species::class) ?? false,
                'update' => $user?->can('updateAny', Species::class) ?? false,
                'delete' => $user?->can('deleteAny', Species::class) ?? false,
            ],
        ]);
    }

    public function create(): RedirectResponse
    {
        $this->authorize('create', Species::class);

        return to_route('medic.species.index');
    }

    public function store(SpeciesStoreRequest $request, CreateSpeciesAction $action): RedirectResponse
    {
        $this->authorize('create', Species::class);

        $company = $request->selectedCompany();
        if (! $company instanceof Company) {
            return back()->withErrors(['name' => 'Debes seleccionar una empresa para crear especies.']);
        }

        $action->execute($request->speciesPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Especie creada correctamente.']);

        return to_route('medic.species.index');
    }

    public function edit(Species $species): RedirectResponse
    {
        $this->authorize('update', $species);

        return to_route('medic.species.index');
    }

    public function update(
        SpeciesUpdateRequest $request,
        Species $species,
        UpdateSpeciesAction $action,
    ): RedirectResponse {
        $this->authorize('update', $species);

        $action->execute($species, $request->speciesPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Especie actualizada correctamente.']);

        return to_route('medic.species.index');
    }

    public function destroy(Species $species, DeleteSpeciesAction $action): RedirectResponse
    {
        $this->authorize('delete', $species);

        $action->execute($species);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Especie eliminada.']);

        return to_route('medic.species.index');
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
