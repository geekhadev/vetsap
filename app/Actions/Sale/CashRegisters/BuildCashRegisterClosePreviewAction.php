<?php

namespace App\Actions\Sale\CashRegisters;

use App\Models\Sale\CashRegister;
use App\Models\Sale\SaleDocumentPayment;
use App\Models\Shared\PaymentMethod;
use Illuminate\Support\Collection;

final class BuildCashRegisterClosePreviewAction
{
    /**
     * Totales del sistema por método de pago para el cuadre:
     * suma de pagos del POS en esta caja; en efectivo se suma además el monto de apertura.
     *
     * @return list<array{payment_method_id: string, payment_method_name: string, payment_method_code: string, system_amount: int}>
     */
    public function execute(CashRegister $cashRegister): array
    {
        /** @var Collection<int, PaymentMethod> $methods */
        $methods = PaymentMethod::query()
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        /** @var Collection<string, int|string> $paymentsByMethod */
        $paymentsByMethod = SaleDocumentPayment::query()
            ->where('cash_register_id', $cashRegister->id)
            ->groupBy('payment_method_id')
            ->selectRaw('payment_method_id, SUM(amount) as total_amount')
            ->pluck('total_amount', 'payment_method_id');

        $openingAmount = (int) $cashRegister->opening_amount;

        return $methods
            ->map(function (PaymentMethod $method) use ($openingAmount, $paymentsByMethod): array {
                $paymentsTotal = (int) ($paymentsByMethod->get($method->id) ?? 0);
                $systemAmount = $method->code === 'EF'
                    ? $openingAmount + $paymentsTotal
                    : $paymentsTotal;

                return [
                    'payment_method_id' => $method->id,
                    'payment_method_name' => $method->name,
                    'payment_method_code' => $method->code,
                    'system_amount' => $systemAmount,
                ];
            })
            ->values()
            ->all();
    }
}
