<?php

namespace App\Actions\Sale\SaleDocuments;

use App\Enums\Sale\SaleDocumentPaymentStatus;
use App\Enums\Sale\SaleDocumentStatus;
use App\Models\Sale\SaleDocument;
use App\Models\Sale\SaleDocumentPayment;

final class BuildSaleDocumentPaymentsAction
{
    /**
     * @return array{
     *     id: string,
     *     status: string,
     *     payment_status: string,
     *     total_amount: int,
     *     paid_amount: int,
     *     balance_amount: int,
     *     can: array{charge: bool},
     *     payments: list<array{
     *         id: string,
     *         amount: int,
     *         paid_at: string|null,
     *         payment_method: array{id: string, name: string, code: string}|null,
     *         created_by: array{id: string, name: string}|null
     *     }>
     * }
     */
    public function execute(SaleDocument $document, bool $userCanCreate = false): array
    {
        $document->loadMissing([
            'payments' => static fn ($query) => $query->orderBy('paid_at')->orderBy('created_at'),
            'payments.paymentMethod:id,name,code',
            'payments.createdBy:id,name',
        ]);

        $totalAmount = (int) $document->total_amount;
        $paidAmount = (int) $document->paid_amount;
        $balanceAmount = max(0, $totalAmount - $paidAmount);

        return [
            'id' => $document->id,
            'status' => $document->status->value,
            'payment_status' => $document->payment_status->value,
            'total_amount' => $totalAmount,
            'paid_amount' => $paidAmount,
            'balance_amount' => $balanceAmount,
            'can' => [
                'charge' => $userCanCreate && (
                    $document->status === SaleDocumentStatus::Draft
                    || (
                        $document->status === SaleDocumentStatus::Issued
                        && $balanceAmount > 0
                        && $document->payment_status !== SaleDocumentPaymentStatus::Paid
                    )
                ),
            ],
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
