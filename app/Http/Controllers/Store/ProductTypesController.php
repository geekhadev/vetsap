<?php

namespace App\Http\Controllers\Store;

use App\Actions\Store\ProductTypes\CreateProductTypeAction;
use App\Actions\Store\ProductTypes\DeleteProductTypeAction;
use App\Actions\Store\ProductTypes\ListProductTypesForCompanyAction;
use App\Actions\Store\ProductTypes\UpdateProductTypeAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Store\ProductTypeListRequest;
use App\Http\Requests\Store\ProductTypeStoreRequest;
use App\Http\Requests\Store\ProductTypeUpdateRequest;
use App\Models\Company;
use App\Models\Store\ProductType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class ProductTypesController extends Controller
{
    public function index(
        ProductTypeListRequest $request,
        ListProductTypesForCompanyAction $list,
    ): Response {
        $this->authorize('viewAny', ProductType::class);

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

        return Inertia::render('store/product-types/index', [
            'data' => $data,
            'filters' => $request->filtersForFrontend(),
            'can' => [
                'create' => $user?->can('create', ProductType::class) ?? false,
                'update' => $user?->can('updateAny', ProductType::class) ?? false,
                'delete' => $user?->can('deleteAny', ProductType::class) ?? false,
            ],
        ]);
    }

    public function create(): RedirectResponse
    {
        $this->authorize('create', ProductType::class);

        return to_route('store.product-types.index');
    }

    public function store(ProductTypeStoreRequest $request, CreateProductTypeAction $action): RedirectResponse
    {
        $this->authorize('create', ProductType::class);

        if ($request->selectedCompany() === null) {
            return back()->withErrors(['name' => 'Debes seleccionar una empresa para crear tipos de productos.']);
        }

        $action->execute($request->productTypePayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Tipo de producto creado correctamente.']);

        return to_route('store.product-types.index');
    }

    public function edit(ProductType $productType): RedirectResponse
    {
        $this->authorize('update', $productType);

        return to_route('store.product-types.index');
    }

    public function update(
        ProductTypeUpdateRequest $request,
        ProductType $productType,
        UpdateProductTypeAction $action,
    ): RedirectResponse {
        $this->authorize('update', $productType);

        $action->execute($productType, $request->productTypePayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Tipo de producto actualizado correctamente.']);

        return to_route('store.product-types.index');
    }

    public function destroy(ProductType $productType, DeleteProductTypeAction $action): RedirectResponse
    {
        $this->authorize('delete', $productType);

        $action->execute($productType);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Tipo de producto eliminado.']);

        return to_route('store.product-types.index');
    }
}
