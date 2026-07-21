<?php

namespace App\Actions\Sale\SaleDocuments;

use App\Enums\Sale\SaleDocumentStatus;
use App\Models\Medic\ClinicalAttention;
use App\Models\Sale\Customer;
use App\Models\Sale\SaleDocument;
use Illuminate\Support\Facades\DB;

final class EnsureDraftSaleDocumentForAttentionAction
{
    public function __construct(
        private SyncDraftSaleDocumentFromAttentionAction $syncFromAttention,
    ) {}

    /**
     * Garantiza un borrador de venta para el cliente de la atención.
     * Si ya existe una venta abierta del cliente, reutiliza esa y le agrega/sincroniza
     * los servicios de esta atención.
     */
    public function execute(ClinicalAttention $attention, ?string $userId = null): SaleDocument
    {
        $attention->loadMissing([
            'patient:id,customer_id,name,company_id',
            'patient.customer',
            'appointment:id,service_id,price,customer_id,office_id',
            'appointment.service:id,name,price,tax_treatment',
            'requestedServices:id,name,price,tax_treatment',
        ]);

        $customer = $attention->patient?->customer;

        if (! $customer instanceof Customer) {
            throw new \RuntimeException('La atención no tiene un cliente asociado.');
        }

        return DB::transaction(function () use ($attention, $customer, $userId): SaleDocument {
            /** @var SaleDocument|null $document */
            $document = SaleDocument::query()
                ->where('company_id', $attention->company_id)
                ->where('customer_id', $customer->id)
                ->where('status', SaleDocumentStatus::Draft)
                ->orderBy('created_at')
                ->lockForUpdate()
                ->first();

            if (! $document instanceof SaleDocument) {
                $document = SaleDocument::query()->create([
                    'company_id' => $attention->company_id,
                    'office_id' => $attention->appointment?->office_id,
                    'customer_id' => $customer->id,
                    'clinical_attention_id' => $attention->id,
                    'status' => SaleDocumentStatus::Draft,
                    'customer_name' => $customer->name,
                    'customer_document_type' => $customer->document_type?->value,
                    'customer_document_number' => $customer->document_number,
                    'customer_phone' => $customer->phone,
                    'customer_email' => $customer->email,
                    'customer_address' => $customer->address,
                    'tax_percent' => (float) config('vetsap.sale.default_tax_percent', 19),
                    'created_by_user_id' => $userId,
                    'updated_by_user_id' => $userId,
                ]);
            } elseif ($document->office_id === null && $attention->appointment?->office_id) {
                $document->update([
                    'office_id' => $attention->appointment->office_id,
                    'updated_by_user_id' => $userId,
                ]);
            }

            return $this->syncFromAttention->execute($document, $attention, $userId);
        });
    }
}
