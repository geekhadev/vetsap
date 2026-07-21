<?php

namespace App\Actions\Purchase\PurchaseOrders;

use App\Models\Purchase\PurchaseOrder;
use App\Support\Pagination\ListFilterPagination;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class ListPurchaseOrdersForCompanyAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(string $companyId, array $filters): LengthAwarePaginator
    {
        ['sort' => $sort, 'direction' => $direction, 'per_page' => $perPage] = ListFilterPagination::resolveFromFilters(
            $filters,
            PurchaseOrder::SORTABLE_COLUMNS,
            defaultSort: 'ordered_at',
            defaultDirection: 'desc',
        );

        return PurchaseOrder::query()
            ->forCompany($companyId)
            ->with([
                'supplier:id,name,document_number',
                'purchaseOrderStatus:id,name,color',
                'user:id,name',
                'details.product:id,name,barcode',
            ])
            ->search($filters['search'] ?? null)
            ->filterSupplierId($filters['supplier_id'] ?? null)
            ->filterPurchaseOrderStatusId($filters['purchase_order_status_id'] ?? null)
            ->orderByColumn($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }
}
