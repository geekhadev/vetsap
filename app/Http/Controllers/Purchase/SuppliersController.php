<?php

namespace App\Http\Controllers\Purchase;

use App\Actions\Purchase\Suppliers\CreateSupplierAction;
use App\Actions\Purchase\Suppliers\DeleteSupplierAction;
use App\Actions\Purchase\Suppliers\ListSuppliersForCompanyAction;
use App\Actions\Purchase\Suppliers\UpdateSupplierAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Purchase\SupplierListRequest;
use App\Http\Requests\Purchase\SupplierStoreRequest;
use App\Http\Requests\Purchase\SupplierUpdateRequest;
use App\Models\Company;
use App\Models\Purchase\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class SuppliersController extends Controller
{
    public function index(
        SupplierListRequest $request,
        ListSuppliersForCompanyAction $list,
    ): Response {
        $this->authorize('viewAny', Supplier::class);

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

        return Inertia::render('purchase/suppliers/index', [
            'data' => $data,
            'filters' => $request->filtersForFrontend(),
            'can' => [
                'create' => $user?->can('create', Supplier::class) ?? false,
                'update' => $user?->can('updateAny', Supplier::class) ?? false,
                'delete' => $user?->can('deleteAny', Supplier::class) ?? false,
            ],
        ]);
    }

    public function create(): RedirectResponse
    {
        $this->authorize('create', Supplier::class);

        return to_route('purchase.suppliers.index');
    }

    public function store(SupplierStoreRequest $request, CreateSupplierAction $action): RedirectResponse
    {
        $this->authorize('create', Supplier::class);

        $company = $request->selectedCompany();
        if (! $company instanceof Company) {
            return back()->withErrors(['name' => 'Debes seleccionar una empresa para crear proveedores.']);
        }

        $action->execute($request->supplierPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Proveedor creado correctamente.']);

        return to_route('purchase.suppliers.index');
    }

    public function edit(Supplier $supplier): RedirectResponse
    {
        $this->authorize('update', $supplier);

        return to_route('purchase.suppliers.index');
    }

    public function update(
        SupplierUpdateRequest $request,
        Supplier $supplier,
        UpdateSupplierAction $action,
    ): RedirectResponse {
        $this->authorize('update', $supplier);

        $action->execute($supplier, $request->supplierPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Proveedor actualizado correctamente.']);

        return to_route('purchase.suppliers.index');
    }

    public function destroy(Supplier $supplier, DeleteSupplierAction $action): RedirectResponse
    {
        $this->authorize('delete', $supplier);

        $action->execute($supplier);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Proveedor eliminado.']);

        return to_route('purchase.suppliers.index');
    }
}
