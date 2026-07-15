<?php

namespace App\Actions\Store\ProductMovements;

use App\Models\Store\InventoryMovement;
use App\Models\Store\InventoryMovementDetail;
use App\Models\Store\Product;
use App\Support\Pagination\ListFilterPagination;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

final class ListProductMovementsForCompanyAction
{
    public const SORTABLE_COLUMNS = [
        'moved_at',
        'number',
        'quantity',
        'created_at',
    ];

    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(string $companyId, array $filters): LengthAwarePaginator
    {
        ['sort' => $sort, 'direction' => $direction, 'per_page' => $perPage] = ListFilterPagination::resolveFromFilters(
            $filters,
            self::SORTABLE_COLUMNS,
            defaultSort: 'moved_at',
            defaultDirection: 'desc',
        );

        $movementsTable = (new InventoryMovement)->getTable();
        $detailsTable = (new InventoryMovementDetail)->getTable();
        $productsTable = (new Product)->getTable();

        $query = InventoryMovementDetail::query()
            ->select("{$detailsTable}.*")
            ->join($movementsTable, "{$movementsTable}.id", '=', "{$detailsTable}.inventory_movement_id")
            ->join($productsTable, "{$productsTable}.id", '=', "{$detailsTable}.product_id")
            ->where("{$productsTable}.company_id", $companyId)
            ->with([
                'product:id,name,barcode',
                'inventoryMovement:id,type,number,moved_at,movement_category_id,user_id',
                'inventoryMovement.movementCategory:id,name,type',
            ]);

        $productId = $filters['product_id'] ?? null;
        if (is_string($productId) && $productId !== '') {
            $query->where("{$detailsTable}.product_id", $productId);
        }

        $type = $filters['type'] ?? null;
        if (is_string($type) && $type !== '') {
            $query->where("{$movementsTable}.type", $type);
        }

        $search = $filters['search'] ?? null;
        if (is_string($search) && $search !== '') {
            $term = '%'.str_replace(['%', '_'], ['\\%', '\\_'], $search).'%';
            $query->where(function (Builder $inner) use ($term, $search, $productsTable, $movementsTable): void {
                $inner->where("{$productsTable}.name", 'like', $term)
                    ->orWhere("{$productsTable}.barcode", 'like', $term);

                if (ctype_digit($search)) {
                    $inner->orWhere("{$movementsTable}.number", (int) $search);
                } else {
                    $inner->orWhere("{$movementsTable}.number", 'like', $term);
                }
            });
        }

        $orderColumn = match ($sort) {
            'number' => "{$movementsTable}.number",
            'quantity' => "{$detailsTable}.quantity",
            'created_at' => "{$detailsTable}.created_at",
            default => "{$movementsTable}.moved_at",
        };

        return $query
            ->orderBy($orderColumn, $direction)
            ->orderBy("{$detailsTable}.id", 'desc')
            ->paginate($perPage)
            ->withQueryString();
    }
}
