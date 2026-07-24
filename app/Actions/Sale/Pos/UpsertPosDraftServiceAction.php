<?php

namespace App\Actions\Sale\Pos;

use App\Actions\Sale\SaleDocuments\EnsureOpenDraftSaleDocumentForCustomerAction;
use App\Actions\Sale\SaleDocuments\RecalculateSaleDocumentTotalsAction;
use App\Enums\Sale\SaleDocumentDetailType;
use App\Enums\Sale\SaleDocumentStatus;
use App\Enums\Sale\TaxTreatment;
use App\Models\Medic\Service;
use App\Models\Sale\Customer;
use App\Models\Sale\SaleDocumentDetail;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class UpsertPosDraftServiceAction
{
    public function __construct(
        private EnsureOpenDraftSaleDocumentForCustomerAction $ensureDraft,
        private RecalculateSaleDocumentTotalsAction $recalculate,
        private LoadCustomerDraftAttentionsForPosAction $loadCart,
    ) {}

    /**
     * Agrega (o suma cantidad) un servicio al borrador abierto del cliente.
     *
     * @return array<string, mixed>
     */
    public function execute(
        Customer $customer,
        string $serviceId,
        ?string $userId = null,
        int $quantityDelta = 1,
    ): array {
        return DB::transaction(function () use ($customer, $serviceId, $userId, $quantityDelta): array {
            $service = Service::query()
                ->where('company_id', $customer->company_id)
                ->where('is_active', true)
                ->whereKey($serviceId)
                ->firstOrFail();

            $document = $this->ensureDraft->execute($customer, $userId);

            if ($document->status !== SaleDocumentStatus::Draft) {
                throw ValidationException::withMessages([
                    'sale_document' => 'Solo se pueden editar documentos en borrador.',
                ]);
            }

            $delta = max(1, $quantityDelta);

            /** @var SaleDocumentDetail|null $existing */
            $existing = $document->details()
                ->where('detail_type', SaleDocumentDetailType::Service)
                ->where('service_id', $service->id)
                ->whereNull('clinical_attention_id')
                ->lockForUpdate()
                ->first();

            $treatment = $service->tax_treatment ?? TaxTreatment::Exempt;

            if ($existing instanceof SaleDocumentDetail) {
                $existing->update([
                    'quantity' => (int) $existing->quantity + $delta,
                    'unit_price' => (int) ($service->price ?? 0),
                    'description' => $service->name,
                    'tax_treatment' => $treatment,
                    'tax_percent' => $treatment === TaxTreatment::Taxable
                        ? (float) ($document->tax_percent ?: config('vetsap.sale.default_tax_percent', 19))
                        : 0,
                ]);
            } else {
                $sort = (int) $document->details()->max('sort_order');

                SaleDocumentDetail::query()->create([
                    'sale_document_id' => $document->id,
                    'detail_type' => SaleDocumentDetailType::Service,
                    'service_id' => $service->id,
                    'product_id' => null,
                    'clinical_attention_id' => null,
                    'description' => $service->name,
                    'quantity' => $delta,
                    'unit_price' => (int) ($service->price ?? 0),
                    'discount_percent' => 0,
                    'discount_amount' => 0,
                    'tax_treatment' => $treatment,
                    'tax_percent' => $treatment === TaxTreatment::Taxable
                        ? (float) ($document->tax_percent ?: config('vetsap.sale.default_tax_percent', 19))
                        : 0,
                    'gross_amount' => 0,
                    'net_amount' => 0,
                    'exempt_amount' => 0,
                    'tax_amount' => 0,
                    'detail_total' => 0,
                    'sort_order' => $sort + 1,
                ]);
            }

            $document->update(['updated_by_user_id' => $userId]);
            $this->recalculate->execute($document->fresh(['details']));

            return $this->loadCart->execute($customer->fresh());
        });
    }
}
