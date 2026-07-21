<?php

namespace App\Actions\Medic\ClinicalAttentions;

use App\Actions\Sale\SaleDocuments\EnsureDraftSaleDocumentForAttentionAction;
use App\Enums\Medic\ClinicalAttentionStatus;
use App\Models\Medic\ClinicalAttention;
use Illuminate\Support\Facades\DB;

final class ClosePatientDraftAttentionAction
{
    public function __construct(
        private EnsureDraftSaleDocumentForAttentionAction $ensureDraftSaleDocument,
    ) {}

    /**
     * @param  array{
     *     appointment_id?: string|null,
     *     template_id: string,
     *     patient_id: string,
     *     doctor_id: string,
     *     updated_by_user_id?: string|null,
     *     values?: array<string, mixed>,
     *     requested_service_ids?: list<string>,
     *     document_template_ids?: list<string>
     * }  $data
     */
    public function execute(ClinicalAttention $attention, array $data): ClinicalAttention
    {
        if ($attention->status !== ClinicalAttentionStatus::Draft) {
            throw new \RuntimeException('Solo se pueden cerrar atenciones en borrador.');
        }

        return DB::transaction(function () use ($attention, $data): ClinicalAttention {
            $values = $data['values'] ?? [];
            $requestedServiceIds = $data['requested_service_ids'] ?? [];
            $documentTemplateIds = $data['document_template_ids'] ?? [];
            unset($data['values'], $data['requested_service_ids'], $data['document_template_ids']);

            $attention->update([
                ...$data,
                'status' => ClinicalAttentionStatus::Closed,
                'closed_at' => now(),
            ]);

            $attention->values()->delete();

            foreach ($values as $fieldKey => $value) {
                if ($value === null || $value === '') {
                    continue;
                }

                $attention->values()->create([
                    'field_key' => $fieldKey,
                    'value' => $value,
                ]);
            }

            $attention->requestedServices()->sync($requestedServiceIds);
            $attention->documentTemplates()->sync($documentTemplateIds);

            $attention = $attention->refresh()->load([
                'patient:id,name,record_number,customer_id',
                'patient.customer',
                'doctor:id,first_name,last_name',
                'template:id,name',
                'values',
                'requestedServices:id,name,price,tax_treatment',
                'documentTemplates:id,title',
                'appointment.service:id,name,price,tax_treatment',
            ]);

            // Actualiza la venta abierta con los servicios finales antes de salir.
            try {
                $this->ensureDraftSaleDocument->execute(
                    $attention,
                    $data['updated_by_user_id'] ?? null,
                );
            } catch (\Throwable) {
                // Si no hay cliente/venta asociada, no bloquea el cierre clínico.
            }

            return $attention;
        });
    }
}
