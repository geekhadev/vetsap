<?php

namespace App\Http\Controllers\Store;

use App\Actions\Store\MovementCategories\CreateMovementCategoryAction;
use App\Actions\Store\MovementCategories\DeleteMovementCategoryAction;
use App\Actions\Store\MovementCategories\ListMovementCategoriesForCompanyAction;
use App\Actions\Store\MovementCategories\UpdateMovementCategoryAction;
use App\Enums\Store\InventoryMovementType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Store\MovementCategoryListRequest;
use App\Http\Requests\Store\MovementCategoryStoreRequest;
use App\Http\Requests\Store\MovementCategoryUpdateRequest;
use App\Models\Company;
use App\Models\Store\MovementCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class MovementCategoriesController extends Controller
{
    public function index(
        MovementCategoryListRequest $request,
        ListMovementCategoriesForCompanyAction $list,
    ): Response {
        $this->authorize('viewAny', MovementCategory::class);

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

        return Inertia::render('store/movement-categories/index', [
            'data' => $data,
            'filters' => $request->filtersForFrontend(),
            'movementTypes' => $this->movementTypeOptions(),
            'can' => [
                'create' => $user?->can('create', MovementCategory::class) ?? false,
                'update' => $user?->can('updateAny', MovementCategory::class) ?? false,
                'delete' => $user?->can('deleteAny', MovementCategory::class) ?? false,
            ],
        ]);
    }

    public function create(): RedirectResponse
    {
        $this->authorize('create', MovementCategory::class);

        return to_route('store.movement-categories.index');
    }

    public function store(
        MovementCategoryStoreRequest $request,
        CreateMovementCategoryAction $action,
    ): RedirectResponse {
        $this->authorize('create', MovementCategory::class);

        $company = $request->selectedCompany();
        if (! $company instanceof Company) {
            return back()->withErrors(['name' => 'Debes seleccionar una empresa para crear categorías de movimiento.']);
        }

        $action->execute($request->movementCategoryPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Categoría de movimiento creada correctamente.']);

        return to_route('store.movement-categories.index');
    }

    public function edit(MovementCategory $movementCategory): RedirectResponse
    {
        $this->authorize('update', $movementCategory);

        return to_route('store.movement-categories.index');
    }

    public function update(
        MovementCategoryUpdateRequest $request,
        MovementCategory $movementCategory,
        UpdateMovementCategoryAction $action,
    ): RedirectResponse {
        $this->authorize('update', $movementCategory);

        $action->execute($movementCategory, $request->movementCategoryPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Categoría de movimiento actualizada correctamente.']);

        return to_route('store.movement-categories.index');
    }

    public function destroy(
        MovementCategory $movementCategory,
        DeleteMovementCategoryAction $action,
    ): RedirectResponse {
        $this->authorize('delete', $movementCategory);

        $action->execute($movementCategory);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Categoría de movimiento eliminada.']);

        return to_route('store.movement-categories.index');
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
}
