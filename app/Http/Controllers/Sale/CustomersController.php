<?php

namespace App\Http\Controllers\Sale;

use App\Actions\Sale\Customers\CreateCustomerAction;
use App\Actions\Sale\Customers\DeleteCustomerAction;
use App\Actions\Sale\Customers\ListCustomersForCompanyAction;
use App\Actions\Sale\Customers\UpdateCustomerAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Sale\CustomerListRequest;
use App\Http\Requests\Sale\CustomerStoreRequest;
use App\Http\Requests\Sale\CustomerUpdateRequest;
use App\Models\Company;
use App\Models\Medic\Patient;
use App\Models\Medic\Species;
use App\Models\Sale\Customer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class CustomersController extends Controller
{
    public function index(
        CustomerListRequest $request,
        ListCustomersForCompanyAction $list,
    ): Response {
        $this->authorize('viewAny', Customer::class);

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

        return Inertia::render('sale/customers/index', [
            'data' => $data,
            'filters' => $request->filtersForFrontend(),
            'species' => $company instanceof Company
                ? Species::query()
                    ->forCompanyOrGlobal($company->id)
                    ->where('is_active', true)
                    ->orderBy('name')
                    ->get(['id', 'name'])
                : [],
            'can' => [
                'create' => $user?->can('create', Customer::class) ?? false,
                'update' => $user?->can('updateAny', Customer::class) ?? false,
                'delete' => $user?->can('deleteAny', Customer::class) ?? false,
                'patients' => [
                    'create' => $user?->can('create', Patient::class) ?? false,
                    'update' => $user?->can('updateAny', Patient::class) ?? false,
                    'delete' => $user?->can('deleteAny', Patient::class) ?? false,
                ],
            ],
        ]);
    }

    public function create(): RedirectResponse
    {
        $this->authorize('create', Customer::class);

        return to_route('sale.customers.index');
    }

    public function store(CustomerStoreRequest $request, CreateCustomerAction $action): RedirectResponse
    {
        $this->authorize('create', Customer::class);

        $company = $request->selectedCompany();
        if (! $company instanceof Company) {
            return back()->withErrors(['name' => 'Debes seleccionar una empresa para crear clientes.']);
        }

        $action->execute($request->customerPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Cliente creado correctamente.']);

        return to_route('sale.customers.index');
    }

    public function edit(Customer $customer): RedirectResponse
    {
        $this->authorize('update', $customer);

        return to_route('sale.customers.index');
    }

    public function update(
        CustomerUpdateRequest $request,
        Customer $customer,
        UpdateCustomerAction $action,
    ): RedirectResponse {
        $this->authorize('update', $customer);

        $action->execute($customer, $request->customerPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Cliente actualizado correctamente.']);

        return to_route('sale.customers.index');
    }

    public function destroy(Customer $customer, DeleteCustomerAction $action): RedirectResponse
    {
        $this->authorize('delete', $customer);

        $action->execute($customer);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Cliente eliminado.']);

        return to_route('sale.customers.index');
    }
}
