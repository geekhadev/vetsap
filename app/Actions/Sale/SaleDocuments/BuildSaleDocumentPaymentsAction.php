<?php

namespace App\Actions\Sale\SaleDocuments;

use App\Models\Sale\SaleDocument;
use App\Models\Sale\SaleDocumentPayment;

final class BuildSaleDocumentPaymentsAction
{
    /**
     * @return array{
     *     id: string,
     *     total_amount: int,
     *     paid_amount: int,
     *     balance_amount: int,
     *     payments: list<array{
     *         id: string,
     *         amount: int,
     *         paid_at: string|null,
     *         payment_method: array{id: string, name: string, code: string}|null,
     *         created_by: array{id: string, name: string}|null
     *     }>
     * }
     */
    public function execute(SaleDocument $document): array
    {
        $document->loadMissing([
            'payments' => static fn ($query) => $query->orderBy('paid_at')->orderBy('created_at'),
            'payments.paymentMethod:id,name,code',
            'payments.createdBy:id,name',
        ]);

        $totalAmount = (int) $document->total_amount;
        $paidAmount = (int) $document->paid_amount;

        return [
            'id' => $document->id,
            'total_amount' => $totalAmount,
            'paid_amount' => $paidAmount,
            'balance_amount' => max(0, $totalAmount - $paidAmount),
            'payments' => $document->payments
                ->map(static function (SaleDocumentPayment $payment): array {
                    $method = $payment->paymentMethod;
                    $createdBy = $payment->createdBy;

                    return [
                        'id' => $payment->id,
                        'amount' => (int) $payment->amount,
                        'paid_at' => $payment->paid_at?->toIso8601String(),
                        'payment_method' => $method
                            ? [
                                'id' => $method->id,
                                'name' => $method->name,
                                'code' => $method->code,
                            ]
                            : null,
                        'created_by' => $createdBy
                            ? [
                                'id' => $createdBy->id,
                                'name' => $createdBy->name,
                            ]
                            : null,
                    ];
                })
                ->values()
                ->all(),
        ];
    }
}
