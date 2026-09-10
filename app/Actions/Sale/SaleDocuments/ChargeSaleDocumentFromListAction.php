<?php

namespace App\Actions\Sale\SaleDocuments;

use App\Enums\Sale\SaleDocumentPaymentStatus;
use App\Enums\Sale\SaleDocumentStatus;
use App\Models\Sale\SaleDocument;
use Illuminate\Validation\ValidationException;

final class ChargeSaleDocumentFromListAction
{
    public function __construct(
        private ChargePosSaleAction $chargePos,
        private RegisterSaleDocumentPaymentsAction $registerPayments,
    ) {}

    /**
     * Cobra un borrador (emite) o registra pagos sobre un emitido con saldo.
     *
     * @param  array{
     *     cash_register_id: string,
     *     sii_tax_document_type_id?: string|null,
     *     payment_type_id?: string|null,
     *     payments: list<array{payment_method_id: string, amount: int}>
     * }  $data
     */
    public function execute(
        SaleDocument $document,
        string $companyId,
        string $userId,
        array $data,
    ): SaleDocument {
        if ($document->company_id !== $companyId) {
            throw ValidationException::withMessages([
                'sale_document' => 'El documento no pertenece a la empresa seleccionada.',
            ]);
        }

        return match ($document->status) {
            SaleDocumentStatus::Draft => $this->chargeDraft($document, $companyId, $userId, $data),
            SaleDocumentStatus::Issued => $this->payIssued($document, $userId, $data),
            default => throw ValidationException::withMessages([
                'sale_document' => 'Este documento no admite cobro desde el listado.',
            ]),
        };
    }

    /**
     * @param  array{
     *     cash_register_id: string,
     *     sii_tax_document_type_id?: string|null,
     *     payment_type_id?: string|null,
     *     payments: list<array{payment_method_id: string, amount: int}>
     * }  $data
     */
    private function chargeDraft(
        SaleDocument $document,
        string $companyId,
        string $userId,
        array $data,
    ): SaleDocument {
        $customerId = $document->customer_id;

        if (! is_string($customerId) || $customerId === '') {
            throw ValidationException::withMessages([
                'sale_document' => 'El documento no tiene cliente asociado.',
            ]);
        }

        $paymentTypeId = $data['payment_type_id'] ?? null;

        if (! is_string($paymentTypeId) || $paymentTypeId === '') {
            throw ValidationException::withMessages([
                'payment_type_id' => 'Selecciona el tipo de pago.',
            ]);
        }

        return $this->chargePos->execute($companyId, $userId, [
            'customer_id' => $customerId,
            'cash_register_id' => $data['cash_register_id'],
            'sii_tax_document_type_id' => $data['sii_tax_document_type_id'] ?? null,
            'payment_type_id' => $paymentTypeId,
            'global_discount_percent' => (float) $document->global_discount_percent,
            'draft_sale_document_ids' => [$document->id],
            'payments' => $data['payments'],
            'notes' => $document->notes,
        ]);
    }

    /**
     * @param  array{
     *     cash_register_id: string,
     *     payments: list<array{payment_method_id: string, amount: int}>
     * }  $data
     */
    private function payIssued(
        SaleDocument $document,
        string $userId,
        array $data,
    ): SaleDocument {
        if ($document->payment_status === SaleDocumentPaymentStatus::Paid) {
            throw ValidationException::withMessages([
                'sale_document' => 'El documento no tiene saldo pendiente.',
            ]);
        }

        return $this->registerPayments->execute($document, $userId, [
            'cash_register_id' => $data['cash_register_id'],
            'payments' => $data['payments'],
        ]);
    }
}
