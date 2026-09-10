<?php

namespace App\Actions\Sale\SaleDocuments;

use App\Enums\Sale\SaleDocumentPaymentStatus;
use App\Enums\Sale\SaleDocumentStatus;
use App\Models\Sale\SaleDocument;
use App\Models\Shared\PaymentMethod;
use App\Models\Shared\PaymentType;
use App\Models\Shared\SiiTaxDocumentType;

final class BuildSaleDocumentChargeContextAction
{
    /**
     * @return array{
     *     id: string,
     *     status: string,
     *     payment_status: string,
     *     total_amount: int,
     *     paid_amount: int,
     *     balance_amount: int,
     *     can_charge: bool,
     *     requires_issue_fields: bool,
     *     payment_type: array{id: string, name: string, code: string, is_credit: bool}|null,
     *     options: array{
     *         payment_methods: list<array{id: string, name: string, code: string}>,
     *         payment_types: list<array{id: string, name: string, code: string, is_credit: bool}>,
     *         sii_tax_document_types: list<array{id: string, code: string, name: string, abbreviation: string}>,
     *         cash_round_to: int,
     *         cash_round_threshold: int
     *     }
     * }
     */
    public function execute(SaleDocument $document, bool $userCanCreate): array
    {
        $document->loadMissing('paymentType:id,name,code,is_credit');

        $totalAmount = (int) $document->total_amount;
        $paidAmount = (int) $document->paid_amount;
        $balanceAmount = max(0, $totalAmount - $paidAmount);

        $canCharge = $userCanCreate && $this->documentAllowsCharge($document, $balanceAmount);

        $paymentType = $document->paymentType;

        return [
            'id' => $document->id,
            'status' => $document->status->value,
            'payment_status' => $document->payment_status->value,
            'total_amount' => $totalAmount,
            'paid_amount' => $paidAmount,
            'balance_amount' => $balanceAmount,
            'can_charge' => $canCharge,
            'requires_issue_fields' => $document->status === SaleDocumentStatus::Draft,
            'payment_type' => $paymentType instanceof PaymentType
                ? [
                    'id' => $paymentType->id,
                    'name' => $paymentType->name,
                    'code' => $paymentType->code,
                    'is_credit' => $paymentType->isCredit(),
                ]
                : null,
            'options' => [
                'payment_methods' => PaymentMethod::query()
                    ->orderBy('name')
                    ->get(['id', 'name', 'code'])
                    ->map(static fn (PaymentMethod $method): array => [
                        'id' => $method->id,
                        'name' => $method->name,
                        'code' => $method->code,
                    ])
                    ->all(),
                'payment_types' => PaymentType::query()
                    ->orderBy('name')
                    ->get(['id', 'name', 'code', 'is_credit'])
                    ->map(static fn (PaymentType $type): array => [
                        'id' => $type->id,
                        'name' => $type->name,
                        'code' => $type->code,
                        'is_credit' => $type->isCredit(),
                    ])
                    ->all(),
                'sii_tax_document_types' => SiiTaxDocumentType::query()
                    ->where('use_sale', true)
                    ->orderBy('code')
                    ->get(['id', 'code', 'name', 'abbreviation'])
                    ->map(static fn (SiiTaxDocumentType $type): array => [
                        'id' => $type->id,
                        'code' => $type->code,
                        'name' => $type->name,
                        'abbreviation' => $type->abbreviation,
                    ])
                    ->all(),
                'cash_round_to' => (int) config('vetsap.sale.cash_round_to', 10),
                'cash_round_threshold' => (int) config('vetsap.sale.cash_round_threshold', 5),
            ],
        ];
    }

    private function documentAllowsCharge(SaleDocument $document, int $balanceAmount): bool
    {
        return match ($document->status) {
            SaleDocumentStatus::Draft => true,
            SaleDocumentStatus::Issued => $balanceAmount > 0
                && $document->payment_status !== SaleDocumentPaymentStatus::Paid,
            default => false,
        };
    }
}
