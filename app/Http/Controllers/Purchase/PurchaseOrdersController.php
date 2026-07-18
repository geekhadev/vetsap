<?php

namespace App\Http\Controllers\Purchase;

use App\Actions\Purchase\PurchaseOrders\CreatePurchaseOrderAction;
use App\Actions\Purchase\PurchaseOrders\DeletePurchaseOrderAction;
use App\Actions\Purchase\PurchaseOrders\ListPurchaseOrdersForCompanyAction;
use App\Actions\Purchase\PurchaseOrders\UpdatePurchaseOrderAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Purchase\PurchaseOrderListRequest;
use App\Http\Requests\Purchase\PurchaseOrderStoreRequest;
use App\Http\Requests\Purchase\PurchaseOrderUpdateRequest;
use App\Models\Company;
use App\Models\Purchase\PurchaseOrder;
use App\Models\Purchase\PurchaseOrderStatus;
use App\Models\Purchase\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseOrdersController extends Controller
{
    public function index(
        PurchaseOrderListRequest $request,
        ListPurchaseOrdersForCompanyAction $list,
    ): Response {
        $this->authorize('viewAny', PurchaseOrder::class);

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

        return Inertia::render('purchase/purchase-orders/index', [
            'data' => $data,
            'filters' => $request->filtersForFrontend(),
            'suppliers' => $company instanceof Company
                ? $this->supplierOptions($company->id)
                : [],
            'purchaseOrderStatuses' => $company instanceof Company
                ? $this->statusOptions($company->id)
                : [],
            'can' => [
                'create' => $user?->can('create', PurchaseOrder::class) ?? false,
                'update' => $user?->can('updateAny', PurchaseOrder::class) ?? false,
                'delete' => $user?->can('deleteAny', PurchaseOrder::class) ?? false,
            ],
        ]);
    }

    public function create(): RedirectResponse
    {
        $this->authorize('create', PurchaseOrder::class);

        return to_route('purchase.purchase-orders.index');
    }

    public function store(
        PurchaseOrderStoreRequest $request,
        CreatePurchaseOrderAction $action,
    ): RedirectResponse {
        $this->authorize('create', PurchaseOrder::class);

        $company = $request->selectedCompany();
        if (! $company instanceof Company) {
            return back()->withErrors(['ordered_at' => 'Debes seleccionar una empresa para crear órdenes de compra.']);
        }

        $action->execute($request->purchaseOrderPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Orden de compra registrada correctamente.']);

        return to_route('purchase.purchase-orders.index');
    }

    public function edit(PurchaseOrder $purchaseOrder): RedirectResponse
    {
        $this->authorize('update', $purchaseOrder);

        return to_route('purchase.purchase-orders.index');
    }

    public function update(
        PurchaseOrderUpdateRequest $request,
        PurchaseOrder $purchaseOrder,
        UpdatePurchaseOrderAction $action,
    ): RedirectResponse {
        $this->authorize('update', $purchaseOrder);

        $action->execute($purchaseOrder, $request->purchaseOrderPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Orden de compra actualizada correctamente.']);

        return to_route('purchase.purchase-orders.index');
    }

    public function destroy(
        PurchaseOrder $purchaseOrder,
        DeletePurchaseOrderAction $action,
    ): RedirectResponse {
        $this->authorize('delete', $purchaseOrder);

        $action->execute($purchaseOrder);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Orden de compra eliminada.']);

        return to_route('purchase.purchase-orders.index');
    }

    /**
     * @return list<array{id: string, name: string, document_number: string}>
     */
    private function supplierOptions(string $companyId): array
    {
        return Supplier::query()
            ->forCompany($companyId)
            ->orderBy('name')
            ->get(['id', 'name', 'document_number'])
            ->map(fn (Supplier $row): array => [
                'id' => $row->id,
                'name' => $row->name,
                'document_number' => $row->document_number,
            ])
            ->all();
    }

    /**
     * @return list<array{id: string, name: string, color: string}>
     */
    private function statusOptions(string $companyId): array
    {
        return PurchaseOrderStatus::query()
            ->forCompanyOrGlobal($companyId)
            ->orderBy('name')
            ->get(['id', 'name', 'color'])
            ->map(fn (PurchaseOrderStatus $row): array => [
                'id' => $row->id,
                'name' => $row->name,
                'color' => $row->color->value,
            ])
            ->all();
    }
}
