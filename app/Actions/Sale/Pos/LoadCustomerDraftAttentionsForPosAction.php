<?php

namespace App\Actions\Sale\Pos;

use App\Actions\Sale\SaleDocuments\EnsureDraftSaleDocumentForAttentionAction;
use App\Enums\Medic\ClinicalAttentionStatus;
use App\Enums\Sale\SaleDocumentStatus;
use App\Models\Medic\ClinicalAttention;
use App\Models\Sale\Customer;
use App\Models\Sale\SaleDocument;
use Illuminate\Support\Collection;

final class LoadCustomerDraftAttentionsForPosAction
{
    public function __construct(
        private EnsureDraftSaleDocumentForAttentionAction $ensureDraftSaleDocument,
    ) {}

    /**
     * Ventas abiertas (documentos en borrador) del cliente para el PTV.
     * Las atenciones del cliente se consolidan en el mismo borrador abierto.
     *
     * @return array{
     *     customer: array{id: string, name: string, document_type: string|null, document_number: string|null, phone: string|null},
     *     global_discount_percent: float,
     *     total_amount: int,
     *     totals: array{
     *         exempt_amount: int,
     *         net_amount: int,
     *         details_discount_amount: int,
     *         global_discount_amount: int,
     *         global_discount_percent: float,
     *         tax_amount: int,
     *         total_amount: int
     *     },
     *     attentions: list<array{
     *         id: string,
     *         sale_document_id: string,
     *         started_at: string|null,
     *         patient: array{id: string, name: string},
     *         template_name: string|null,
     *         services: list<array{
     *             id: string,
     *             name: string,
     *             notes: string|null,
     *             price: int|null,
     *             tax_treatment: string,
     *             detail_type: string,
     *             quantity: int,
     *             discount_percent: float,
     *             detail_total: int,
     *             patient_name: string|null,
     *             detail_id: string,
     *             product_id: string|null,
     *             service_id: string|null
     *         }>,
     *         total_amount: int,
     *         global_discount_percent: float
     *     }>
     * }
     */
    public function execute(Customer $customer): array
    {
        // Cada atención draft del cliente se vuelca al mismo documento abierto.
        ClinicalAttention::query()
            ->where('company_id', $customer->company_id)
            ->where('status', ClinicalAttentionStatus::Draft)
            ->whereHas('patient', function ($patientQuery) use ($customer): void {
                $patientQuery->where('customer_id', $customer->id);
            })
            ->with([
                'patient.customer',
                'appointment.service',
                'requestedServices',
            ])
            ->orderBy('started_at')
            ->orderBy('created_at')
            ->each(function (ClinicalAttention $attention) use ($customer): void {
                if ($attention->patient?->customer_id !== $customer->id) {
                    return;
                }

                $this->ensureDraftSaleDocument->execute($attention);
            });

        /** @var Collection<int, SaleDocument> $documents */
        $documents = SaleDocument::query()
            ->where('company_id', $customer->company_id)
            ->where('customer_id', $customer->id)
            ->where('status', SaleDocumentStatus::Draft)
            ->whereHas('details')
            ->with([
                'details.clinicalAttention.patient:id,name',
                'clinicalAttention.patient:id,name',
                'clinicalAttention.template:id,name',
            ])
            ->orderByDesc('created_at')
            ->get();

        $openDraft = SaleDocument::query()
            ->where('company_id', $customer->company_id)
            ->where('customer_id', $customer->id)
            ->where('status', SaleDocumentStatus::Draft)
            ->orderBy('created_at')
            ->first();

        return [
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'document_type' => $customer->document_type?->value,
                'document_number' => $customer->document_number,
                'phone' => $customer->phone,
            ],
            'global_discount_percent' => (float) ($openDraft?->global_discount_percent ?? $documents->first()?->global_discount_percent ?? 0),
            'total_amount' => (int) $documents->sum('total_amount'),
            'totals' => [
                'exempt_amount' => (int) $documents->sum('exempt_amount'),
                'net_amount' => (int) $documents->sum('net_amount'),
                'details_discount_amount' => (int) $documents->sum('details_discount_amount'),
                'global_discount_amount' => (int) $documents->sum('global_discount_amount'),
                'global_discount_percent' => (float) ($openDraft?->global_discount_percent ?? $documents->first()?->global_discount_percent ?? 0),
                'tax_amount' => (int) $documents->sum('tax_amount'),
                'total_amount' => (int) $documents->sum('total_amount'),
            ],
            'attentions' => $documents
                ->map(static function (SaleDocument $document): array {
                    $attention = $document->clinicalAttention;
                    $patient = $attention?->patient;

                    $services = $document->details
                        ->map(static function ($detail): array {
                            return [
                                'id' => $detail->id,
                                'detail_id' => $detail->id,
                                'product_id' => $detail->product_id,
                                'service_id' => $detail->service_id,
                                'name' => $detail->description,
                                'notes' => $detail->notes,
                                'price' => (int) $detail->unit_price,
                                'tax_treatment' => $detail->tax_treatment->value,
                                'detail_type' => $detail->detail_type->value,
                                'quantity' => (int) $detail->quantity,
                                'discount_percent' => (float) $detail->discount_percent,
                                'detail_total' => (int) $detail->detail_total,
                                'patient_name' => $detail->clinicalAttention?->patient?->name,
                            ];
                        })
                        ->values()
                        ->all();

                    return [
                        'id' => $attention?->id ?? $document->id,
                        'sale_document_id' => $document->id,
                        'started_at' => ($attention?->started_at ?? $document->created_at)?->toIso8601String(),
                        'patient' => [
                            'id' => $patient?->id ?? '',
                            'name' => $patient?->name ?? 'Venta abierta',
                        ],
                        'template_name' => $attention?->template?->name,
                        'services' => $services,
                        'total_amount' => (int) $document->total_amount,
                        'global_discount_percent' => (float) $document->global_discount_percent,
                    ];
                })
                ->values()
                ->all(),
        ];
    }
}
