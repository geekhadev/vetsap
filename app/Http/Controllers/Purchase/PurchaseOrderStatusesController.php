<?php

namespace App\Http\Controllers\Purchase;

use App\Actions\Purchase\PurchaseOrderStatuses\CreatePurchaseOrderStatusAction;
use App\Actions\Purchase\PurchaseOrderStatuses\DeletePurchaseOrderStatusAction;
use App\Actions\Purchase\PurchaseOrderStatuses\ListPurchaseOrderStatusesForCompanyAction;
use App\Actions\Purchase\PurchaseOrderStatuses\UpdatePurchaseOrderStatusAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Purchase\PurchaseOrderStatusListRequest;
use App\Http\Requests\Purchase\PurchaseOrderStatusStoreRequest;
use App\Http\Requests\Purchase\PurchaseOrderStatusUpdateRequest;
use App\Models\Company;
use App\Models\Purchase\PurchaseOrderStatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseOrderStatusesController extends Controller
{
    public function index(
        PurchaseOrderStatusListRequest $request,
        ListPurchaseOrderStatusesForCompanyAction $list,
    ): Response {
        $this->authorize('viewAny', PurchaseOrderStatus::class);

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

        return Inertia::render('purchase/purchase-order-statuses/index', [
            'data' => $data,
            'filters' => $request->filtersForFrontend(),
            'can' => [
                'create' => $user?->can('create', PurchaseOrderStatus::class) ?? false,
                'update' => $user?->can('updateAny', PurchaseOrderStatus::class) ?? false,
                'delete' => $user?->can('deleteAny', PurchaseOrderStatus::class) ?? false,
            ],
        ]);
    }

    public function create(): RedirectResponse
    {
        $this->authorize('create', PurchaseOrderStatus::class);

        return to_route('purchase.purchase-order-statuses.index');
    }

    public function store(PurchaseOrderStatusStoreRequest $request, CreatePurchaseOrderStatusAction $action): RedirectResponse
    {
        $this->authorize('create', PurchaseOrderStatus::class);

        $company = $request->selectedCompany();
        if (! $company instanceof Company) {
            return back()->withErrors(['name' => 'Debes seleccionar una empresa para crear estados de orden de compra.']);
        }

        $action->execute($request->purchaseOrderStatusPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Estado de orden de compra creado correctamente.']);

        return to_route('purchase.purchase-order-statuses.index');
    }

    public function edit(PurchaseOrderStatus $purchaseOrderStatus): RedirectResponse
    {
        $this->authorize('update', $purchaseOrderStatus);

        return to_route('purchase.purchase-order-statuses.index');
    }

    public function update(
        PurchaseOrderStatusUpdateRequest $request,
        PurchaseOrderStatus $purchaseOrderStatus,
        UpdatePurchaseOrderStatusAction $action,
    ): RedirectResponse {
        $this->authorize('update', $purchaseOrderStatus);

        $action->execute($purchaseOrderStatus, $request->purchaseOrderStatusPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Estado de orden de compra actualizado correctamente.']);

        return to_route('purchase.purchase-order-statuses.index');
    }

    public function destroy(PurchaseOrderStatus $purchaseOrderStatus, DeletePurchaseOrderStatusAction $action): RedirectResponse
    {
        $this->authorize('delete', $purchaseOrderStatus);

        $action->execute($purchaseOrderStatus);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Estado de orden de compra eliminado.']);

        return to_route('purchase.purchase-order-statuses.index');
    }
}
