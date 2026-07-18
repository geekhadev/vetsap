<?php

namespace App\Http\Controllers\Store;

use App\Actions\Store\InventoryMovements\CreateInventoryMovementAction;
use App\Actions\Store\InventoryMovements\ListInventoryMovementsForCompanyAction;
use App\Enums\Store\InventoryMovementType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Store\InventoryMovementListRequest;
use App\Http\Requests\Store\InventoryMovementStoreRequest;
use App\Models\Company;
use App\Models\Store\InventoryMovement;
use App\Models\Store\MovementCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class InventoryMovementsController extends Controller
{
    public function index(
        InventoryMovementListRequest $request,
        ListInventoryMovementsForCompanyAction $list,
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

        $user = $request->user();

        return Inertia::render('store/inventory-movements/index', [
            'data' => $data,
            'filters' => $request->filtersForFrontend(),
            'movementTypes' => $this->movementTypeOptions(),
            'movementCategories' => $company instanceof Company
                ? $this->categoryOptions($company->id)
                : [],
            'can' => [
                'create' => $user?->can('create', InventoryMovement::class) ?? false,
            ],
        ]);
    }

    public function create(): RedirectResponse
    {
        $this->authorize('create', InventoryMovement::class);

        return to_route('store.inventory-movements.index');
    }

    public function store(
        InventoryMovementStoreRequest $request,
        CreateInventoryMovementAction $action,
    ): RedirectResponse {
        $this->authorize('create', InventoryMovement::class);

        $company = $request->selectedCompany();
        if (! $company instanceof Company) {
            return back()->withErrors(['moved_at' => 'Debes seleccionar una empresa para crear movimientos.']);
        }

        if ($request->movementType() === null) {
            return back()->withErrors(['type' => 'El tipo de movimiento es obligatorio.']);
        }

        $action->execute($request->inventoryMovementPayload());

        $label = $request->movementType()?->label() ?? 'Movimiento';

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Movimiento de {$label} registrado correctamente.",
        ]);

        return to_route('store.inventory-movements.index');
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
     * @return list<array{id: string, name: string, type: string, is_active: bool}>
     */
    private function categoryOptions(string $companyId): array
    {
        return MovementCategory::query()
            ->forCompanyOrGlobal($companyId)
            ->orderBy('name')
            ->get(['id', 'name', 'type', 'is_active', 'company_id'])
            ->map(fn (MovementCategory $row): array => [
                'id' => $row->id,
                'name' => $row->name,
                'type' => $row->type->value,
                'is_active' => $row->is_active,
            ])
            ->all();
    }
}
