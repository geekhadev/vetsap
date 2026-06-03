<?php

namespace App\Http\Controllers\Shared;

use App\Actions\Shared\PaymentTypes\CreatePaymentTypeAction;
use App\Actions\Shared\PaymentTypes\DeletePaymentTypeAction;
use App\Actions\Shared\PaymentTypes\ListPaymentTypesAction;
use App\Actions\Shared\PaymentTypes\UpdatePaymentTypeAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Shared\PaymentTypeListRequest;
use App\Http\Requests\Shared\PaymentTypesRequest;
use App\Models\Shared\PaymentType;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PaymentTypesController extends Controller
{
    public function index(PaymentTypeListRequest $request, ListPaymentTypesAction $action): Response
    {
        $this->authorize('viewAny', PaymentType::class);

        $paymentTypes = $action->execute($request->filtersForAction());

        return Inertia::render('shared/payment-types/index', [
            'data' => $paymentTypes,
            'filters' => $request->filtersForFrontend(),
        ]);
    }

    public function create(): RedirectResponse
    {
        $this->authorize('create', PaymentType::class);

        return to_route('shared.payment-types.index');
    }

    public function store(PaymentTypesRequest $request, CreatePaymentTypeAction $action): RedirectResponse
    {
        $this->authorize('create', PaymentType::class);

        $action->execute($request->paymentTypePayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Tipo de pago creado.']);

        return to_route('shared.payment-types.index');
    }

    public function edit(PaymentType $paymentType): RedirectResponse
    {
        $this->authorize('update', $paymentType);

        return to_route('shared.payment-types.index');
    }

    public function update(PaymentTypesRequest $request, PaymentType $paymentType, UpdatePaymentTypeAction $action): RedirectResponse
    {
        $this->authorize('update', $paymentType);

        $action->execute($paymentType, $request->paymentTypePayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Tipo de pago actualizado.']);

        return to_route('shared.payment-types.index');
    }

    public function destroy(PaymentType $paymentType, DeletePaymentTypeAction $action): RedirectResponse
    {
        $this->authorize('delete', $paymentType);

        $action->execute($paymentType);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Tipo de pago eliminado.']);

        return to_route('shared.payment-types.index');
    }
}
