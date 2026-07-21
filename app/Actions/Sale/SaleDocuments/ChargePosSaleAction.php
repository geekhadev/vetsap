<?php

namespace App\Actions\Sale\SaleDocuments;

use App\Enums\Sale\SaleDocumentDetailType;
use App\Enums\Sale\SaleDocumentPaymentStatus;
use App\Enums\Sale\SaleDocumentStatus;
use App\Enums\Sale\TaxTreatment;
use App\Models\Sale\CashRegister;
use App\Models\Sale\Customer;
use App\Models\Sale\SaleDocument;
use App\Models\Sale\SaleDocumentDetail;
use App\Models\Sale\SaleDocumentPayment;
use App\Models\Shared\PaymentMethod;
use App\Models\Shared\PaymentType;
use App\Models\Shared\SiiTaxDocumentType;
use App\Support\Sale\ChileCashRounding;
use App\Support\Sale\SaleDocumentTotalsCalculator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class ChargePosSaleAction
{
    public function __construct(
        private SaleDocumentTotalsCalculator $calculator,
        private AllocateInternalSaleDocumentNumberAction $allocateInternalDocumentNumber,
    ) {}

    /**
     * Consolida borradores (y detalles sueltos de productos/custom) en un documento pagado.
     *
     * @param  array{
     *     customer_id: string,
     *     cash_register_id: string,
     *     sii_tax_document_type_id?: string|null,
     *     payment_type_id: string,
     *     global_discount_percent?: float|int,
     *     draft_sale_document_ids: list<string>,
     *     extra_details?: list<array{
     *         detail_type: string,
     *         product_id?: string|null,
     *         description: string,
     *         quantity: int,
     *         unit_price: int,
     *         discount_percent?: float|int,
     *         tax_treatment: string
     *     }>,
     *     payments: list<array{payment_method_id: string, amount: int}>,
     *     notes?: string|null
     * }  $data
     */
    public function execute(string $companyId, string $userId, array $data): SaleDocument
    {
        return DB::transaction(function () use ($companyId, $userId, $data): SaleDocument {
            $customer = Customer::query()
                ->where('company_id', $companyId)
                ->whereKey($data['customer_id'])
                ->firstOrFail();

            $cashRegister = CashRegister::query()
                ->where('company_id', $companyId)
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

            /** @var Collection<int, SaleDocument> $drafts */
            $drafts = SaleDocument::query()
                ->where('company_id', $companyId)
                ->where('customer_id', $customer->id)
                ->where('status', SaleDocumentStatus::Draft)
                ->whereIn('id', $data['draft_sale_document_ids'])
                ->with('details')
                ->lockForUpdate()
                ->get();

            if ($drafts->count() !== count(array_unique($data['draft_sale_document_ids']))) {
                throw ValidationException::withMessages([
                    'draft_sale_document_ids' => 'Uno o más documentos borrador no están disponibles.',
                ]);
            }

            if ($drafts->isEmpty() && ($data['extra_details'] ?? []) === []) {
                throw ValidationException::withMessages([
                    'draft_sale_document_ids' => 'No hay detalles para cobrar.',
                ]);
            }

            $detailInputs = [];
            $detailCreates = [];
            $sort = 0;

            foreach ($drafts as $draft) {
                foreach ($draft->details as $detail) {
                    $detailInputs[] = [
                        'quantity' => (int) $detail->quantity,
                        'unit_price' => (int) $detail->unit_price,
                        'discount_percent' => (float) $detail->discount_percent,
                        'tax_treatment' => $detail->tax_treatment,
                        'tax_percent' => (float) $detail->tax_percent,
                    ];
                    $detailCreates[] = [
                        'source' => $detail,
                        'sort_order' => $sort++,
                    ];
                }
            }

            foreach ($data['extra_details'] ?? [] as $extra) {
                $treatment = TaxTreatment::from($extra['tax_treatment']);
                $taxPercent = $treatment === TaxTreatment::Taxable
                    ? (float) config('vetsap.sale.default_tax_percent', 19)
                    : 0.0;

                $detailInputs[] = [
                    'quantity' => (int) $extra['quantity'],
                    'unit_price' => (int) $extra['unit_price'],
                    'discount_percent' => (float) ($extra['discount_percent'] ?? 0),
                    'tax_treatment' => $treatment,
                    'tax_percent' => $taxPercent,
                ];
                $detailCreates[] = [
                    'source' => $extra,
                    'sort_order' => $sort++,
                    'is_extra' => true,
                    'tax_percent' => $taxPercent,
                ];
            }

            if ($detailInputs === []) {
                throw ValidationException::withMessages([
                    'draft_sale_document_ids' => 'No hay detalles para cobrar.',
                ]);
            }

            $taxPercent = (float) config('vetsap.sale.default_tax_percent', 19);
            $globalDiscountPercent = (float) ($data['global_discount_percent'] ?? 0);
            $totals = $this->calculator->calculate($detailInputs, $globalDiscountPercent, $taxPercent);

            $siiTaxDocumentTypeId = $data['sii_tax_document_type_id'] ?? null;
            $documentNumber = null;

            $paymentType = PaymentType::query()
                ->whereKey($data['payment_type_id'])
                ->firstOrFail();

            if (is_string($siiTaxDocumentTypeId) && $siiTaxDocumentTypeId !== '') {
                $siiType = SiiTaxDocumentType::query()->whereKey($siiTaxDocumentTypeId)->first();

                if ($siiType instanceof SiiTaxDocumentType && ! $siiType->isGlobal()) {
                    $documentNumber = $this->allocateInternalDocumentNumber->execute(
                        $companyId,
                        $siiType->id,
                    );
                }
            }

            $headerAttributes = [
                'office_id' => $cashRegister->office_id,
                'cash_register_id' => $cashRegister->id,
                'sii_tax_document_type_id' => $siiTaxDocumentTypeId,
                'payment_type_id' => $paymentType->id,
                'status' => SaleDocumentStatus::Issued,
                'payment_status' => SaleDocumentPaymentStatus::Pending,
                'document_number' => $documentNumber,
                'issued_at' => now(),
                'customer_name' => $customer->name,
                'customer_document_type' => $customer->document_type?->value,
                'customer_document_number' => $customer->document_number,
                'customer_phone' => $customer->phone,
                'customer_email' => $customer->email,
                'customer_address' => $customer->address,
                'tax_percent' => $totals['tax_percent'],
                'tax_amount' => $totals['tax_amount'],
                'details_discount_percent' => $totals['details_discount_percent'],
                'details_discount_amount' => $totals['details_discount_amount'],
                'details_discount_net_amount' => $totals['details_discount_net_amount'],
                'details_discount_exempt_amount' => $totals['details_discount_exempt_amount'],
                'global_discount_percent' => $totals['global_discount_percent'],
                'global_discount_amount' => $totals['global_discount_amount'],
                'global_discount_net_amount' => $totals['global_discount_net_amount'],
                'global_discount_exempt_amount' => $totals['global_discount_exempt_amount'],
                'gross_net_amount' => $totals['gross_net_amount'],
                'gross_exempt_amount' => $totals['gross_exempt_amount'],
                'net_amount' => $totals['net_amount'],
                'exempt_amount' => $totals['exempt_amount'],
                'total_amount' => $totals['total_amount'],
                'paid_amount' => 0,
                'notes' => $data['notes'] ?? null,
                'updated_by_user_id' => $userId,
            ];

            // Un solo borrador: se convierte en el documento pagado (sin dejar "fusionado").
            $promoteDraft = $drafts->count() === 1 ? $drafts->first() : null;

            if ($promoteDraft instanceof SaleDocument) {
                $promoteDraft->details()->delete();
                $promoteDraft->update([
                    ...$headerAttributes,
                    'clinical_attention_id' => $promoteDraft->clinical_attention_id,
                ]);
                $paidDocument = $promoteDraft->fresh();
            } else {
                $paidDocument = SaleDocument::query()->create([
                    'company_id' => $companyId,
                    'customer_id' => $customer->id,
                    'clinical_attention_id' => null,
                    'created_by_user_id' => $userId,
                    ...$headerAttributes,
                ]);
            }

            if (! $paidDocument instanceof SaleDocument) {
                throw ValidationException::withMessages([
                    'draft_sale_document_ids' => 'No se pudo crear el documento de venta.',
                ]);
            }

            foreach ($detailCreates as $index => $meta) {
                $computed = $totals['details'][$index];
                $isExtra = ($meta['is_extra'] ?? false) === true;

                if ($isExtra) {
                    /** @var array<string, mixed> $extra */
                    $extra = $meta['source'];
                    SaleDocumentDetail::query()->create([
                        'sale_document_id' => $paidDocument->id,
                        'detail_type' => SaleDocumentDetailType::from($extra['detail_type']),
                        'service_id' => null,
                        'product_id' => $extra['product_id'] ?? null,
                        'clinical_attention_id' => null,
                        'description' => $extra['description'],
                        'quantity' => (int) $extra['quantity'],
                        'unit_price' => (int) $extra['unit_price'],
                        'discount_percent' => (float) ($extra['discount_percent'] ?? 0),
                        'discount_amount' => $computed['discount_amount'],
                        'tax_treatment' => TaxTreatment::from($extra['tax_treatment']),
                        'tax_percent' => $meta['tax_percent'],
                        'gross_amount' => $computed['gross_amount'],
                        'net_amount' => $computed['net_amount'],
                        'exempt_amount' => $computed['exempt_amount'],
                        'tax_amount' => $computed['tax_amount'],
                        'detail_total' => $computed['detail_total'],
                        'sort_order' => $meta['sort_order'],
                    ]);

                    continue;
                }

                /** @var SaleDocumentDetail $source */
                $source = $meta['source'];
                SaleDocumentDetail::query()->create([
                    'sale_document_id' => $paidDocument->id,
                    'detail_type' => $source->detail_type,
                    'service_id' => $source->service_id,
                    'product_id' => $source->product_id,
                    'clinical_attention_id' => $source->clinical_attention_id,
                    'description' => $source->description,
                    'quantity' => $source->quantity,
                    'unit_price' => $source->unit_price,
                    'discount_percent' => $source->discount_percent,
                    'discount_amount' => $computed['discount_amount'],
                    'tax_treatment' => $source->tax_treatment,
                    'tax_percent' => $source->tax_percent,
                    'gross_amount' => $computed['gross_amount'],
                    'net_amount' => $computed['net_amount'],
                    'exempt_amount' => $computed['exempt_amount'],
                    'tax_amount' => $computed['tax_amount'],
                    'detail_total' => $computed['detail_total'],
                    'sort_order' => $meta['sort_order'],
                ]);
            }

            $paymentsTotal = 0;
            $cashPaid = 0;
            $nonCashPaid = 0;
            $cashMethodIds = PaymentMethod::query()
                ->where('code', 'EF')
                ->pluck('id')
                ->all();

            foreach ($data['payments'] ?? [] as $payment) {
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
                    'sale_document_id' => $paidDocument->id,
                    'cash_register_id' => $cashRegister->id,
                    'payment_method_id' => $payment['payment_method_id'],
                    'amount' => $amount,
                    'paid_at' => now(),
                    'created_by_user_id' => $userId,
                ]);
                $paymentsTotal += $amount;
            }

            $documentTotal = $totals['total_amount'];
            if ($nonCashPaid > $documentTotal) {
                throw ValidationException::withMessages([
                    'payments' => 'Los pagos superan el total del documento.',
                ]);
            }

            $cashDue = ChileCashRounding::roundCashAmount(max(0, $documentTotal - $nonCashPaid));
            $isFullySettled = $cashPaid === $cashDue;

            if ($paymentType->isCredit()) {
                if ($cashPaid > $cashDue) {
                    throw ValidationException::withMessages([
                        'payments' => $cashDue === 0
                            ? 'Los pagos superan el total del documento.'
                            : "El monto en efectivo no puede superar {$cashDue} (redondeo Chile a múltiplos de 10).",
                    ]);
                }
            } else {
                if ($paymentsTotal <= 0) {
                    throw ValidationException::withMessages([
                        'payments' => 'En contado debes registrar el pago completo.',
                    ]);
                }

                if (! $isFullySettled) {
                    throw ValidationException::withMessages([
                        'payments' => $cashDue === 0
                            ? 'La suma de pagos no coincide con el total del documento.'
                            : "El monto en efectivo debe ser {$cashDue} (redondeo Chile a múltiplos de 10).",
                    ]);
                }
            }

            $paidDocument->update([
                'paid_amount' => $paymentsTotal,
                'status' => SaleDocumentStatus::Issued,
                'payment_status' => SaleDocumentPaymentStatus::fromAmounts(
                    $documentTotal,
                    $paymentsTotal,
                ),
            ]);

            // Varios borradores: el consolidado ya es el emitido; se eliminan las fuentes.
            if (! $promoteDraft instanceof SaleDocument) {
                foreach ($drafts as $draft) {
                    $draft->delete();
                }
            }

            return $paidDocument->refresh()->load(['details', 'payments.paymentMethod']);
        });
    }
}
