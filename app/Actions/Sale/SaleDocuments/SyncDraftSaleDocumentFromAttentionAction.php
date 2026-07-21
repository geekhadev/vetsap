<?php

namespace App\Actions\Sale\SaleDocuments;

use App\Enums\Sale\SaleDocumentDetailType;
use App\Enums\Sale\SaleDocumentStatus;
use App\Enums\Sale\TaxTreatment;
use App\Models\Medic\ClinicalAttention;
use App\Models\Medic\Service;
use App\Models\Sale\SaleDocument;
use App\Models\Sale\SaleDocumentDetail;
use App\Support\Sale\SaleDocumentTotalsCalculator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class SyncDraftSaleDocumentFromAttentionAction
{
    public function __construct(
        private RecalculateSaleDocumentTotalsAction $recalculate,
    ) {}

    /**
     * Sincroniza en el documento solo los servicios de esta atención.
     * No toca servicios de otras atenciones ni productos/custom del POS.
     */
    public function execute(
        SaleDocument $document,
        ClinicalAttention $attention,
        ?string $userId = null,
    ): SaleDocument {
        if ($document->status !== SaleDocumentStatus::Draft) {
            throw ValidationException::withMessages([
                'sale_document' => 'Solo se pueden sincronizar documentos en borrador.',
            ]);
        }

        $attention->loadMissing([
            'appointment:id,service_id,price',
            'appointment.service:id,name,price,tax_treatment',
            'requestedServices:id,name,price,tax_treatment',
        ]);

        return DB::transaction(function () use ($document, $attention, $userId): SaleDocument {
            $document->details()
                ->where('detail_type', SaleDocumentDetailType::Service)
                ->where('clinical_attention_id', $attention->id)
                ->delete();

            $sort = (int) $document->details()->max('sort_order');
            $rows = [];

            $primaryService = $this->resolvePrimaryService($attention);
            $primaryServiceId = $primaryService?->id;

            if ($primaryService instanceof Service) {
                $price = $attention->appointment?->service_id === $primaryService->id
                    && $attention->appointment?->price !== null
                    ? (int) $attention->appointment->price
                    : (int) ($primaryService->price ?? 0);

                $rows[] = $this->serviceDetailPayload(
                    $document->id,
                    $attention->id,
                    $primaryService,
                    $price,
                    ++$sort,
                );
            }

            foreach ($attention->requestedServices as $service) {
                if ($primaryServiceId !== null && $service->id === $primaryServiceId) {
                    continue;
                }

                $rows[] = $this->serviceDetailPayload(
                    $document->id,
                    $attention->id,
                    $service,
                    (int) ($service->price ?? 0),
                    ++$sort,
                );
            }

            foreach ($rows as $row) {
                SaleDocumentDetail::query()->create($row);
            }

            $document->update([
                'updated_by_user_id' => $userId,
            ]);

            return $this->recalculate->execute($document->fresh(['details']));
        });
    }

    /**
     * Servicio principal a facturar: el de la cita, o el servicio por defecto
     * de la empresa cuando la atención no tiene cita.
     */
    private function resolvePrimaryService(ClinicalAttention $attention): ?Service
    {
        $appointmentService = $attention->appointment?->service;

        if ($appointmentService instanceof Service) {
            return $appointmentService;
        }

        /** @var Service|null $defaultService */
        $defaultService = Service::query()
            ->forCompany($attention->company_id)
            ->where('is_default', true)
            ->where('is_active', true)
            ->first();

        return $defaultService;
    }

    /**
     * @return array<string, mixed>
     */
    private function serviceDetailPayload(
        string $documentId,
        string $attentionId,
        Service $service,
        int $unitPrice,
        int $sortOrder,
    ): array {
        $taxPercent = (float) config('vetsap.sale.default_tax_percent', 19);
        $treatment = TaxTreatment::Exempt;
        $calculator = app(SaleDocumentTotalsCalculator::class);
        $computed = $calculator->calculate([
            [
                'quantity' => 1,
                'unit_price' => $unitPrice,
                'discount_percent' => 0,
                'tax_treatment' => $treatment,
                'tax_percent' => 0,
            ],
        ], 0, $taxPercent);
        $detail = $computed['details'][0];

        return [
            'sale_document_id' => $documentId,
            'detail_type' => SaleDocumentDetailType::Service,
            'service_id' => $service->id,
            'product_id' => null,
            'clinical_attention_id' => $attentionId,
            'description' => $service->name,
            'quantity' => 1,
            'unit_price' => $unitPrice,
            'discount_percent' => 0,
            'discount_amount' => $detail['discount_amount'],
            'tax_treatment' => $treatment,
            'tax_percent' => 0,
            'gross_amount' => $detail['gross_amount'],
            'net_amount' => $detail['net_amount'],
            'exempt_amount' => $detail['exempt_amount'],
            'tax_amount' => $detail['tax_amount'],
            'detail_total' => $detail['detail_total'],
            'sort_order' => $sortOrder,
        ];
    }
}
