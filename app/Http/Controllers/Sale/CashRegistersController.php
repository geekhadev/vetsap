<?php

namespace App\Http\Controllers\Sale;

use App\Actions\Sale\CashRegisters\CloseCashRegisterAction;
use App\Actions\Sale\CashRegisters\ListCashRegistersForCompanyAction;
use App\Actions\Sale\CashRegisters\OpenCashRegisterAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Sale\CashRegisterCloseRequest;
use App\Http\Requests\Sale\CashRegisterListRequest;
use App\Http\Requests\Sale\CashRegisterOpenRequest;
use App\Models\Company;
use App\Models\Sale\CashRegister;
use Illuminate\Http\RedirectResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class CashRegistersController extends Controller
{
    public function index(
        CashRegisterListRequest $request,
        ListCashRegistersForCompanyAction $list,
    ): Response {
        $this->authorize('viewAny', CashRegister::class);

        $company = $this->resolveCompany($request);
        $filters = $request->filtersForAction();
        $perPage = (int) ($filters['per_page'] ?? 20);

        $data = $company instanceof Company
            ? $list->execute($company->id, $filters)
            : new LengthAwarePaginator([], 0, max(1, $perPage), 1, [
                'path' => $request->url(),
                'query' => $request->query(),
            ]);

        return Inertia::render('sale/cash-registers/index', [
            'data' => $data,
            'filters' => $request->filtersForFrontend(),
            'can' => [
                'create' => $request->user()?->can('create', CashRegister::class) ?? false,
            ],
        ]);
    }

    public function store(
        CashRegisterOpenRequest $request,
        OpenCashRegisterAction $action,
    ): RedirectResponse {
        $this->authorize('create', CashRegister::class);

        $company = $request->selectedCompany();
        if (! $company instanceof Company) {
            return back()->withErrors(['office_id' => 'Debes seleccionar una empresa para abrir caja.']);
        }

        $action->execute($request->openPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Caja abierta correctamente.']);

        return back();
    }

    public function close(
        CashRegisterCloseRequest $request,
        CashRegister $cashRegister,
        CloseCashRegisterAction $action,
    ): RedirectResponse {
        $this->authorize('close', $cashRegister);

        $action->execute(
            $cashRegister,
            (string) $request->user()?->id,
            $request->closePayload(),
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Caja cerrada correctamente.']);

        return back();
    }
}
