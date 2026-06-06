<?php

namespace App\Actions\Store\Products;

use App\Models\Store\Product;
use App\Support\Pagination\ListFilterPagination;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class ListProductsForCompanyAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(string $companyId, array $filters): LengthAwarePaginator
    {
        ['sort' => $sort, 'direction' => $direction, 'per_page' => $perPage] = ListFilterPagination::resolveFromFilters(
            $filters,
            Product::SORTABLE_COLUMNS,
        );

        return Product::query()
            ->forCompany($companyId)
            ->with([
                'productCategory:id,name,company_id',
                'productType:id,name,company_id',
            ])
            ->search($filters['search'] ?? null)
            ->filterProductCategoryId($filters['product_category_id'] ?? null)
            ->filterProductTypeId($filters['product_type_id'] ?? null)
            ->filterIsActive($filters['is_active'] ?? null)
            ->orderByColumn($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }
}
