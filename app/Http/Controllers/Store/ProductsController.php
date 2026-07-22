<?php

namespace App\Http\Controllers\Store;

use App\Actions\Store\Products\CreateProductAction;
use App\Actions\Store\Products\DeleteProductAction;
use App\Actions\Store\Products\FindProductByBarcodeForCompanyAction;
use App\Actions\Store\Products\ListProductsForCompanyAction;
use App\Actions\Store\Products\SearchProductsForCompanyAction;
use App\Actions\Store\Products\UpdateProductAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Store\ProductAutocompleteSearchRequest;
use App\Http\Requests\Store\ProductBarcodeLookupRequest;
use App\Http\Requests\Store\ProductListRequest;
use App\Http\Requests\Store\ProductStoreRequest;
use App\Http\Requests\Store\ProductUpdateRequest;
use App\Models\Company;
use App\Models\Purchase\PurchaseOrder;
use App\Models\Store\InventoryMovement;
use App\Models\Store\Product;
use App\Models\Store\ProductCategory;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class ProductsController extends Controller
{
    public function index(
        ProductListRequest $request,
        ListProductsForCompanyAction $list,
    ): Response {
        $this->authorize('viewAny', Product::class);

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

        return Inertia::render('store/products/index', [
            'data' => $data,
            'filters' => $request->filtersForFrontend(),
            'productCategories' => $company instanceof Company
                ? $this->masterOptions(ProductCategory::class, $company->id)
                : [],
            'can' => [
                'create' => $user?->can('create', Product::class) ?? false,
                'update' => $user?->can('updateAny', Product::class) ?? false,
                'delete' => $user?->can('deleteAny', Product::class) ?? false,
            ],
        ]);
    }

    public function search(
        ProductAutocompleteSearchRequest $request,
        SearchProductsForCompanyAction $search,
    ): JsonResponse {
        $this->authorizeProductAutocomplete($request->user());

        $company = $request->selectedCompany();
        if (! $company instanceof Company) {
            return response()->json(['data' => []]);
        }

        $results = $search->execute(
            $company->id,
            (string) $request->validated('q'),
            $request->excludeIds(),
        );

        return response()->json(['data' => $results]);
    }

    public function lookupByBarcode(
        ProductBarcodeLookupRequest $request,
        FindProductByBarcodeForCompanyAction $find,
    ): JsonResponse {
        $this->authorizeProductAutocomplete($request->user());

        $company = $request->selectedCompany();
        if (! $company instanceof Company) {
            return response()->json(['data' => null]);
        }

        $product = $find->execute(
            $company->id,
            (string) $request->validated('barcode'),
        );

        return response()->json(['data' => $product]);
    }

    public function create(): RedirectResponse
    {
        $this->authorize('create', Product::class);

        return to_route('store.products.index');
    }

    public function store(ProductStoreRequest $request, CreateProductAction $action): RedirectResponse
    {
        $this->authorize('create', Product::class);

        $company = $request->selectedCompany();
        if (! $company instanceof Company) {
            return back()->withErrors(['name' => 'Debes seleccionar una empresa para crear productos.']);
        }

        $action->execute($request->productPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Producto creado correctamente.']);

        return to_route('store.products.index');
    }

    public function edit(Product $product): RedirectResponse
    {
        $this->authorize('update', $product);

        return to_route('store.products.index');
    }

    public function update(
        ProductUpdateRequest $request,
        Product $product,
        UpdateProductAction $action,
    ): RedirectResponse {
        $this->authorize('update', $product);

        $action->execute($product, $request->productPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Producto actualizado correctamente.']);

        return to_route('store.products.index');
    }

    public function destroy(Product $product, DeleteProductAction $action): RedirectResponse
    {
        $this->authorize('delete', $product);

        $action->execute($product);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Producto eliminado.']);

        return to_route('store.products.index');
    }

    private function authorizeProductAutocomplete(?User $user): void
    {
        abort_unless(
            $user instanceof User
            && (
                $user->can('viewAny', Product::class)
                || $user->can('viewAny', PurchaseOrder::class)
                || $user->can('viewAny', InventoryMovement::class)
            ),
            403,
        );
    }

    /**
     * @param  class-string<ProductCategory>  $modelClass
     * @return list<array{id: string, name: string, is_active: bool, is_global: bool}>
     */
    private function masterOptions(string $modelClass, string $companyId): array
    {
        return $modelClass::query()
            ->forCompanyOrGlobal($companyId)
            ->orderBy('name')
            ->get(['id', 'name', 'is_active', 'company_id'])
            ->map(fn ($row): array => [
                'id' => $row->id,
                'name' => $row->name,
                'is_active' => $row->is_active,
                'is_global' => $row->company_id === null,
            ])
            ->all();
    }
}
