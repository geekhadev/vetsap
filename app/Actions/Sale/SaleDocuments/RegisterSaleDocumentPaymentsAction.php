<?php

namespace App\Actions\Sale\SaleDocuments;

use App\Enums\Sale\SaleDocumentPaymentStatus;
use App\Enums\Sale\SaleDocumentStatus;
use App\Models\Sale\CashRegister;
use App\Models\Sale\SaleDocument;
use App\Models\Sale\SaleDocumentPayment;
use App\Models\Shared\PaymentMethod;
use App\Support\Sale\ChileCashRounding;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class RegisterSaleDocumentPaymentsAction
{
    /**
     * Registra abonos sobre un documento ya emitido con saldo pendiente.
     *
     * @param  array{
     *     cash_register_id: string,
     *     payments: list<array{payment_method_id: string, amount: int}>
     * }  $data
     */
    public function execute(SaleDocument $document, string $userId, array $data): SaleDocument
    {
        return DB::transaction(function () use ($document, $userId, $data): SaleDocument {
            /** @var SaleDocument $locked */
            $locked = SaleDocument::query()
                ->whereKey($document->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($locked->status !== SaleDocumentStatus::Issued) {
                throw ValidationException::withMessages([
                    'sale_document' => 'Solo se pueden registrar pagos en documentos emitidos.',
                ]);
            }

            $documentTotal = (int) $locked->total_amount;
            $alreadyPaid = (int) $locked->paid_amount;
            $balance = max(0, $documentTotal - $alreadyPaid);

            if ($balance <= 0 || $locked->payment_status === SaleDocumentPaymentStatus::Paid) {
                throw ValidationException::withMessages([
                    'sale_document' => 'El documento no tiene saldo pendiente.',
                ]);
            }

            $cashRegister = CashRegister::query()
                ->where('company_id', $locked->company_id)
                ->whereKey($data['cash_register_id'])
                ->lockForUpdate()
                ->firstOrFail();

            if (! $cashRegister->isOpen()) {
                throw ValidationException::withMessages([
                    'cash_register_id' => 'La caja debe estar abierta para cobrar.',
                ]);
            }

            if ($cashRegister->opened_by_user_id !== $userId) {
                throw ValidationException::withMessages([
                    'cash_register_id' => 'Solo puedes cobrar con tu caja abierta.',
                ]);
            }

            $locked->loadMissing('paymentType');
            $paymentType = $locked->paymentType;

            if ($paymentType === null) {
                throw ValidationException::withMessages([
                    'sale_document' => 'El documento no tiene tipo de pago definido.',
                ]);
            }

            $paymentsTotal = 0;
            $cashPaid = 0;
            $nonCashPaid = 0;
            $cashMethodIds = PaymentMethod::query()
                ->where('code', 'EF')
                ->pluck('id')
                ->all();

            foreach ($data['payments'] as $payment) {
                $amount = (int) $payment['amount'];
                if ($amount <= 0) {
                    continue;
                }

                $isCash = in_array($payment['payment_method_id'], $cashMethodIds, true);
                if ($isCash) {
                    $amount = ChileCashRounding::roundCashAmount($amount);
                    $cashPaid += $amount;
                } else {
                    $nonCashPaid += $amount;
                }

                SaleDocumentPayment::query()->create([
                    'sale_document_id' => $locked->id,
                    'cash_register_id' => $cashRegister->id,
                    'payment_method_id' => $payment['payment_method_id'],
                    'amount' => $amount,
                    'paid_at' => now(),
                    'created_by_user_id' => $userId,
                ]);
                $paymentsTotal += $amount;
            }

            if ($paymentsTotal <= 0) {
                throw ValidationException::withMessages([
                    'payments' => 'Debes registrar al menos un pago.',
                ]);
            }

            if ($nonCashPaid > $balance) {
                throw ValidationException::withMessages([
                    'payments' => 'Los pagos superan el saldo pendiente.',
                ]);
            }

            $cashDue = ChileCashRounding::roundCashAmount(max(0, $balance - $nonCashPaid));
            $isFullySettled = $cashPaid === $cashDue;

            if ($paymentType->isCredit()) {
                if ($cashPaid > $cashDue) {
                    throw ValidationException::withMessages([
                        'payments' => $cashDue === 0
                            ? 'Los pagos superan el saldo pendiente.'
                            : "El monto en efectivo no puede superar {$cashDue} (redondeo Chile a múltiplos de 10).",
                    ]);
                }
            } elseif (! $isFullySettled) {
                throw ValidationException::withMessages([
                    'payments' => $cashDue === 0
                        ? 'La suma de pagos no coincide con el saldo pendiente.'
                        : "El monto en efectivo debe ser {$cashDue} (redondeo Chile a múltiplos de 10).",
                ]);
            }

            $newPaidAmount = $alreadyPaid + $paymentsTotal;

            $locked->update([
                'paid_amount' => $newPaidAmount,
                'payment_status' => SaleDocumentPaymentStatus::fromAmounts(
                    $documentTotal,
                    $newPaidAmount,
                ),
                'updated_by_user_id' => $userId,
            ]);

            return $locked->refresh()->load(['payments.paymentMethod']);
        });
    }
}
