<?php

namespace App\Http\Controllers\Store;

use App\Actions\Store\ProductCategories\CreateProductCategoryAction;
use App\Actions\Store\ProductCategories\DeleteProductCategoryAction;
use App\Actions\Store\ProductCategories\ListProductCategoriesForCompanyAction;
use App\Actions\Store\ProductCategories\UpdateProductCategoryAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Store\ProductCategoryListRequest;
use App\Http\Requests\Store\ProductCategoryStoreRequest;
use App\Http\Requests\Store\ProductCategoryUpdateRequest;
use App\Models\Company;
use App\Models\Store\ProductCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class ProductCategoriesController extends Controller
{
    public function index(
        ProductCategoryListRequest $request,
        ListProductCategoriesForCompanyAction $list,
    ): Response {
        $this->authorize('viewAny', ProductCategory::class);

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

        return Inertia::render('store/product-categories/index', [
            'data' => $data,
            'filters' => $request->filtersForFrontend(),
            'can' => [
                'create' => $user?->can('create', ProductCategory::class) ?? false,
                'update' => $user?->can('updateAny', ProductCategory::class) ?? false,
                'delete' => $user?->can('deleteAny', ProductCategory::class) ?? false,
            ],
        ]);
    }

    public function create(): RedirectResponse
    {
        $this->authorize('create', ProductCategory::class);

        return to_route('store.product-categories.index');
    }

    public function store(ProductCategoryStoreRequest $request, CreateProductCategoryAction $action): RedirectResponse
    {
        $this->authorize('create', ProductCategory::class);

        if ($request->selectedCompany() === null) {
            return back()->withErrors(['name' => 'Debes seleccionar una empresa para crear categorías de productos.']);
        }

        $action->execute($request->productCategoryPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Categoría de producto creada correctamente.']);

        return to_route('store.product-categories.index');
    }

    public function edit(ProductCategory $productCategory): RedirectResponse
    {
        $this->authorize('update', $productCategory);

        return to_route('store.product-categories.index');
    }

    public function update(
        ProductCategoryUpdateRequest $request,
        ProductCategory $productCategory,
        UpdateProductCategoryAction $action,
    ): RedirectResponse {
        $this->authorize('update', $productCategory);

        $action->execute($productCategory, $request->productCategoryPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Categoría de producto actualizada correctamente.']);

        return to_route('store.product-categories.index');
    }

    public function destroy(ProductCategory $productCategory, DeleteProductCategoryAction $action): RedirectResponse
    {
        $this->authorize('delete', $productCategory);

        $action->execute($productCategory);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Categoría de producto eliminada.']);

        return to_route('store.product-categories.index');
    }
}
