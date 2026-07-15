<?php

namespace App\Http\Controllers\Store;

use App\Actions\Store\ProductMovements\ListProductMovementsForCompanyAction;
use App\Enums\Store\InventoryMovementType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Store\ProductMovementListRequest;
use App\Models\Company;
use App\Models\Store\InventoryMovement;
use App\Models\Store\Product;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class ProductMovementsController extends Controller
{
    public function index(
        ProductMovementListRequest $request,
        ListProductMovementsForCompanyAction $list,
    ): Response {
        $this->authorize('viewAny', InventoryMovement::class);

        $company = $this->resolveCompany($request);
        $filters = $request->filtersForAction();
        $perPage = (int) ($filters['per_page'] ?? 20);

        $data = $company instanceof Company
            ? $list->execute($company->id, $filters)
            : new LengthAwarePaginator([], 0, max(1, $perPage), 1, [
                'path' => $request->url(),
                'query' => $request->query(),
            ]);

        return Inertia::render('store/product-movements/index', [
            'data' => $data,
            'filters' => $request->filtersForFrontend(),
            'movementTypes' => $this->movementTypeOptions(),
            'products' => $company instanceof Company
                ? $this->productOptions($company->id)
                : [],
        ]);
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    private function movementTypeOptions(): array
    {
        return array_map(
            static fn (InventoryMovementType $type): array => [
                'value' => $type->value,
                'label' => $type->label(),
            ],
            InventoryMovementType::cases(),
        );
    }

    /**
     * @return list<array{id: string, name: string, barcode: string|null}>
     */
    private function productOptions(string $companyId): array
    {
        return Product::query()
            ->forCompany($companyId)
            ->orderBy('name')
            ->get(['id', 'name', 'barcode'])
            ->map(fn (Product $row): array => [
                'id' => $row->id,
                'name' => $row->name,
                'barcode' => $row->barcode,
            ])
            ->all();
    }
}
