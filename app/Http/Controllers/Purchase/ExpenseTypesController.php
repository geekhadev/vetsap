<?php

namespace App\Http\Controllers\Purchase;

use App\Actions\Purchase\ExpenseTypes\CreateExpenseTypeAction;
use App\Actions\Purchase\ExpenseTypes\DeleteExpenseTypeAction;
use App\Actions\Purchase\ExpenseTypes\ListExpenseTypesForCompanyAction;
use App\Actions\Purchase\ExpenseTypes\UpdateExpenseTypeAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Purchase\ExpenseTypeListRequest;
use App\Http\Requests\Purchase\ExpenseTypeStoreRequest;
use App\Http\Requests\Purchase\ExpenseTypeUpdateRequest;
use App\Models\Company;
use App\Models\Purchase\ExpenseType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseTypesController extends Controller
{
    public function index(
        ExpenseTypeListRequest $request,
        ListExpenseTypesForCompanyAction $list,
    ): Response {
        $this->authorize('viewAny', ExpenseType::class);

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

        return Inertia::render('purchase/expense-types/index', [
            'data' => $data,
            'filters' => $request->filtersForFrontend(),
            'can' => [
                'create' => $user?->can('create', ExpenseType::class) ?? false,
                'update' => $user?->can('updateAny', ExpenseType::class) ?? false,
                'delete' => $user?->can('deleteAny', ExpenseType::class) ?? false,
            ],
        ]);
    }

    public function create(): RedirectResponse
    {
        $this->authorize('create', ExpenseType::class);

        return to_route('purchase.expense-types.index');
    }

    public function store(ExpenseTypeStoreRequest $request, CreateExpenseTypeAction $action): RedirectResponse
    {
        $this->authorize('create', ExpenseType::class);

        $company = $request->selectedCompany();
        if (! $company instanceof Company) {
            return back()->withErrors(['name' => 'Debes seleccionar una empresa para crear tipos de gasto.']);
        }

        $action->execute($request->expenseTypePayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Tipo de gasto creado correctamente.']);

        return to_route('purchase.expense-types.index');
    }

    public function edit(ExpenseType $expenseType): RedirectResponse
    {
        $this->authorize('update', $expenseType);

        return to_route('purchase.expense-types.index');
    }

    public function update(
        ExpenseTypeUpdateRequest $request,
        ExpenseType $expenseType,
        UpdateExpenseTypeAction $action,
    ): RedirectResponse {
        $this->authorize('update', $expenseType);

        $action->execute($expenseType, $request->expenseTypePayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Tipo de gasto actualizado correctamente.']);

        return to_route('purchase.expense-types.index');
    }

    public function destroy(ExpenseType $expenseType, DeleteExpenseTypeAction $action): RedirectResponse
    {
        $this->authorize('delete', $expenseType);

        $action->execute($expenseType);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Tipo de gasto eliminado.']);

        return to_route('purchase.expense-types.index');
    }
}
