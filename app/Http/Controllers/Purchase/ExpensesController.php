<?php

namespace App\Http\Controllers\Purchase;

use App\Actions\Purchase\Expenses\CreateExpenseAction;
use App\Actions\Purchase\Expenses\DeleteExpenseAction;
use App\Actions\Purchase\Expenses\ListExpensesForCompanyAction;
use App\Actions\Purchase\Expenses\UpdateExpenseAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Purchase\ExpenseListRequest;
use App\Http\Requests\Purchase\ExpenseStoreRequest;
use App\Http\Requests\Purchase\ExpenseUpdateRequest;
use App\Models\Company;
use App\Models\Purchase\Expense;
use App\Models\Purchase\ExpenseType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class ExpensesController extends Controller
{
    public function index(
        ExpenseListRequest $request,
        ListExpensesForCompanyAction $list,
    ): Response {
        $this->authorize('viewAny', Expense::class);

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

        return Inertia::render('purchase/expenses/index', [
            'data' => $data,
            'filters' => $request->filtersForFrontend(),
            'expenseTypes' => $company instanceof Company
                ? $this->expenseTypeOptions($company->id)
                : [],
            'can' => [
                'create' => $user?->can('create', Expense::class) ?? false,
                'update' => $user?->can('updateAny', Expense::class) ?? false,
                'delete' => $user?->can('deleteAny', Expense::class) ?? false,
            ],
        ]);
    }

    public function create(): RedirectResponse
    {
        $this->authorize('create', Expense::class);

        return to_route('purchase.expenses.index');
    }

    public function store(ExpenseStoreRequest $request, CreateExpenseAction $action): RedirectResponse
    {
        $this->authorize('create', Expense::class);

        $company = $request->selectedCompany();
        if (! $company instanceof Company) {
            return back()->withErrors(['spent_at' => 'Debes seleccionar una empresa para registrar gastos.']);
        }

        $action->execute($request->expensePayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Gasto registrado correctamente.']);

        return to_route('purchase.expenses.index');
    }

    public function edit(Expense $expense): RedirectResponse
    {
        $this->authorize('update', $expense);

        return to_route('purchase.expenses.index');
    }

    public function update(
        ExpenseUpdateRequest $request,
        Expense $expense,
        UpdateExpenseAction $action,
    ): RedirectResponse {
        $this->authorize('update', $expense);

        $action->execute($expense, $request->expensePayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Gasto actualizado correctamente.']);

        return to_route('purchase.expenses.index');
    }

    public function destroy(Expense $expense, DeleteExpenseAction $action): RedirectResponse
    {
        $this->authorize('delete', $expense);

        $action->execute($expense);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Gasto eliminado.']);

        return to_route('purchase.expenses.index');
    }

    /**
     * @return list<array{id: string, name: string, abbreviation: string}>
     */
    private function expenseTypeOptions(string $companyId): array
    {
        return ExpenseType::query()
            ->forCompanyOrGlobal($companyId)
            ->orderBy('name')
            ->get(['id', 'name', 'abbreviation'])
            ->map(fn (ExpenseType $row): array => [
                'id' => $row->id,
                'name' => $row->name,
                'abbreviation' => $row->abbreviation,
            ])
            ->all();
    }
}
