<?php

namespace App\Http\Controllers\Medic;

use App\Actions\Medic\VaccinationProtocols\CreateVaccinationProtocolAction;
use App\Actions\Medic\VaccinationProtocols\DeleteVaccinationProtocolAction;
use App\Actions\Medic\VaccinationProtocols\ListVaccinationProtocolsForCompanyAction;
use App\Actions\Medic\VaccinationProtocols\UpdateVaccinationProtocolAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Medic\VaccinationProtocolListRequest;
use App\Http\Requests\Medic\VaccinationProtocolStoreRequest;
use App\Http\Requests\Medic\VaccinationProtocolUpdateRequest;
use App\Models\Company;
use App\Models\Medic\Species;
use App\Models\Medic\VaccinationProtocol;
use App\Models\Store\Product;
use App\Models\Store\ProductCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class VaccinationProtocolsController extends Controller
{
    public function index(
        VaccinationProtocolListRequest $request,
        ListVaccinationProtocolsForCompanyAction $list,
    ): Response {
        $this->authorize('viewAny', VaccinationProtocol::class);

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

        return Inertia::render('medic/vaccination-protocols/index', [
            'data' => $data,
            'filters' => $request->filtersForFrontend(),
            'species' => $this->speciesOptions($company),
            'vaccineProducts' => $this->vaccineProductOptions($company),
            'can' => [
                'create' => $user?->can('create', VaccinationProtocol::class) ?? false,
                'update' => $user?->can('updateAny', VaccinationProtocol::class) ?? false,
                'delete' => $user?->can('deleteAny', VaccinationProtocol::class) ?? false,
            ],
        ]);
    }

    public function create(): RedirectResponse
    {
        $this->authorize('create', VaccinationProtocol::class);

        return to_route('medic.vaccination-protocols.index');
    }

    public function store(
        VaccinationProtocolStoreRequest $request,
        CreateVaccinationProtocolAction $action,
    ): RedirectResponse {
        $this->authorize('create', VaccinationProtocol::class);

        $company = $request->selectedCompany();
        if (! $company instanceof Company) {
            return back()->withErrors(['name' => 'Debes seleccionar una empresa para crear protocolos.']);
        }

        $action->execute($request->protocolPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Protocolo creado correctamente.']);

        return to_route('medic.vaccination-protocols.index');
    }

    public function edit(VaccinationProtocol $vaccinationProtocol): RedirectResponse
    {
        $this->authorize('update', $vaccinationProtocol);

        return to_route('medic.vaccination-protocols.index');
    }

    public function update(
        VaccinationProtocolUpdateRequest $request,
        VaccinationProtocol $vaccinationProtocol,
        UpdateVaccinationProtocolAction $action,
    ): RedirectResponse {
        $this->authorize('update', $vaccinationProtocol);

        $action->execute($vaccinationProtocol, $request->protocolPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Nueva versión del protocolo creada.']);

        return to_route('medic.vaccination-protocols.index');
    }

    public function destroy(
        VaccinationProtocol $vaccinationProtocol,
        DeleteVaccinationProtocolAction $action,
    ): RedirectResponse {
        $this->authorize('delete', $vaccinationProtocol);

        $action->execute($vaccinationProtocol);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Protocolo eliminado.']);

        return to_route('medic.vaccination-protocols.index');
    }

    /**
     * @return list<array{id: string, name: string}>
     */
    private function speciesOptions(?Company $company): array
    {
        if (! $company instanceof Company) {
            return [];
        }

        return Species::query()
            ->forCompanyOrGlobal($company->id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Species $row): array => [
                'id' => $row->id,
                'name' => $row->name,
            ])
            ->all();
    }

    /**
     * @return list<array{id: string, name: string}>
     */
    private function vaccineProductOptions(?Company $company): array
    {
        if (! $company instanceof Company) {
            return [];
        }

        $categoryId = ProductCategory::query()
            ->whereNull('company_id')
            ->where('name', ProductCategory::GLOBAL_VACCINES_NAME)
            ->value('id');

        if (! is_string($categoryId) || $categoryId === '') {
            return [];
        }

        return Product::query()
            ->forCompany($company->id)
            ->where('product_category_id', $categoryId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Product $row): array => [
                'id' => $row->id,
                'name' => $row->name,
            ])
            ->all();
    }
}
