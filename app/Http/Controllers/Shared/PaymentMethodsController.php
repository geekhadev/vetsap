<?php

namespace App\Http\Controllers\Shared;

use App\Actions\Shared\PaymentMethods\CreatePaymentMethodAction;
use App\Actions\Shared\PaymentMethods\DeletePaymentMethodAction;
use App\Actions\Shared\PaymentMethods\ListPaymentMethodsAction;
use App\Actions\Shared\PaymentMethods\UpdatePaymentMethodAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Shared\PaymentMethodListRequest;
use App\Http\Requests\Shared\PaymentMethodsRequest;
use App\Models\Shared\PaymentMethod;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PaymentMethodsController extends Controller
{
    public function index(PaymentMethodListRequest $request, ListPaymentMethodsAction $action): Response
    {
        $this->authorize('viewAny', PaymentMethod::class);

        $paymentMethods = $action->execute($request->filtersForAction());

        return Inertia::render('shared/payment-methods/index', [
            'data' => $paymentMethods,
            'filters' => $request->filtersForFrontend(),
        ]);
    }

    public function create(): RedirectResponse
    {
        $this->authorize('create', PaymentMethod::class);

        return to_route('shared.payment-methods.index');
    }

    public function store(PaymentMethodsRequest $request, CreatePaymentMethodAction $action): RedirectResponse
    {
        $this->authorize('create', PaymentMethod::class);

        $action->execute($request->paymentMethodPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Método de pago creado.']);

        return to_route('shared.payment-methods.index');
    }

    public function edit(PaymentMethod $paymentMethod): RedirectResponse
    {
        $this->authorize('update', $paymentMethod);

        return to_route('shared.payment-methods.index');
    }

    public function update(PaymentMethodsRequest $request, PaymentMethod $paymentMethod, UpdatePaymentMethodAction $action): RedirectResponse
    {
        $this->authorize('update', $paymentMethod);

        $action->execute($paymentMethod, $request->paymentMethodPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Método de pago actualizado.']);

        return to_route('shared.payment-methods.index');
    }

    public function destroy(PaymentMethod $paymentMethod, DeletePaymentMethodAction $action): RedirectResponse
    {
        $this->authorize('delete', $paymentMethod);

        $action->execute($paymentMethod);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Método de pago eliminado.']);

        return to_route('shared.payment-methods.index');
    }
}
