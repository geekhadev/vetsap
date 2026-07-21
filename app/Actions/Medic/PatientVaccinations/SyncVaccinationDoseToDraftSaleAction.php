<?php

namespace App\Actions\Medic\PatientVaccinations;

use App\Actions\Sale\SaleDocuments\EnsureOpenDraftSaleDocumentForCustomerAction;
use App\Actions\Sale\SaleDocuments\RecalculateSaleDocumentTotalsAction;
use App\Enums\Medic\VaccinationAdministeredOrigin;
use App\Enums\Medic\VaccinationDoseStatus;
use App\Enums\Sale\SaleDocumentDetailType;
use App\Enums\Sale\SaleDocumentStatus;
use App\Enums\Sale\TaxTreatment;
use App\Models\Agenda\Appointment;
use App\Models\Medic\PatientVaccinationDose;
use App\Models\Medic\Service;
use App\Models\Sale\Customer;
use App\Models\Sale\SaleDocument;
use App\Models\Sale\SaleDocumentDetail;
use App\Models\Store\Product;
use Illuminate\Support\Facades\DB;

/**
 * Encola producto de la dosis y, si hay cita vinculada, el servicio de agenda.
 * Independiente de atención clínica. No elimina líneas al clear (v1).
 */
final class SyncVaccinationDoseToDraftSaleAction
{
    public function __construct(
        private EnsureOpenDraftSaleDocumentForCustomerAction $ensureDraft,
        private RecalculateSaleDocumentTotalsAction $recalculate,
    ) {}

    public function execute(
        PatientVaccinationDose $dose,
        ?string $userId = null,
    ): void {
        if (
            $dose->status !== VaccinationDoseStatus::Administered
            || $dose->administered_origin !== VaccinationAdministeredOrigin::Clinic
        ) {
            return;
        }

        $dose->loadMissing([
            'plan:id,patient_id,company_id',
            'plan.patient:id,customer_id,company_id',
            'plan.patient.customer',
            'product:id,name,price,tax_treatment,company_id',
            'appointment:id,service_id,price',
            'appointment.service:id,name,price,tax_treatment',
        ]);

        $customer = $dose->plan?->patient?->customer;

        if (! $customer instanceof Customer) {
            return;
        }

        $product = $dose->product;

        if (! $product instanceof Product) {
            return;
        }

        DB::transaction(function () use ($dose, $customer, $product, $userId): void {
            $document = $this->resolveDraftDocument($dose, $customer, $userId);

            if ($document === null || $document->status !== SaleDocumentStatus::Draft) {
                return;
            }

            $this->upsertProductLine($document, $dose, $product);
            $this->upsertAppointmentServiceLine($document, $dose);

            $document->update(['updated_by_user_id' => $userId]);
            $this->recalculate->execute($document->fresh(['details']));
        });
    }

    private function resolveDraftDocument(
        PatientVaccinationDose $dose,
        Customer $customer,
        ?string $userId,
    ): ?SaleDocument {
        /** @var SaleDocumentDetail|null $existingProduct */
        $existingProduct = SaleDocumentDetail::query()
            ->where('patient_vaccination_dose_id', $dose->id)
            ->lockForUpdate()
            ->first();

        if ($existingProduct instanceof SaleDocumentDetail) {
            return $existingProduct->saleDocument()->lockForUpdate()->first();
        }

        return $this->ensureDraft->execute($customer, $userId)->fresh();
    }

    private function upsertProductLine(
        SaleDocument $document,
        PatientVaccinationDose $dose,
        Product $product,
    ): void {
        $taxPercent = (float) ($document->tax_percent ?: config('vetsap.sale.default_tax_percent', 19));
        $treatment = $product->tax_treatment ?? TaxTreatment::Taxable;

        /** @var SaleDocumentDetail|null $existing */
        $existing = SaleDocumentDetail::query()
            ->where('patient_vaccination_dose_id', $dose->id)
            ->lockForUpdate()
            ->first();

        if ($existing instanceof SaleDocumentDetail) {
            if ($existing->sale_document_id !== $document->id) {
                return;
            }

            $existing->update([
                'product_id' => $product->id,
                'clinical_attention_id' => null,
                'description' => $product->name,
                'quantity' => 1,
                'unit_price' => (int) ($product->price ?? 0),
                'tax_treatment' => $treatment,
                'tax_percent' => $treatment === TaxTreatment::Taxable ? $taxPercent : 0,
            ]);

            return;
        }

        $sort = (int) $document->details()->max('sort_order');

        SaleDocumentDetail::query()->create([
            'sale_document_id' => $document->id,
            'detail_type' => SaleDocumentDetailType::Product,
            'service_id' => null,
            'product_id' => $product->id,
            'clinical_attention_id' => null,
            'patient_vaccination_dose_id' => $dose->id,
            'appointment_id' => null,
            'description' => $product->name,
            'quantity' => 1,
            'unit_price' => (int) ($product->price ?? 0),
            'discount_percent' => 0,
            'discount_amount' => 0,
            'tax_treatment' => $treatment,
            'tax_percent' => $treatment === TaxTreatment::Taxable ? $taxPercent : 0,
            'gross_amount' => 0,
            'net_amount' => 0,
            'exempt_amount' => 0,
            'tax_amount' => 0,
            'detail_total' => 0,
            'sort_order' => $sort + 1,
        ]);
    }

    private function upsertAppointmentServiceLine(
        SaleDocument $document,
        PatientVaccinationDose $dose,
    ): void {
        $appointment = $dose->appointment;

        if (! $appointment instanceof Appointment) {
            return;
        }

        $service = $appointment->service;

        if (! $service instanceof Service) {
            return;
        }

        $unitPrice = $appointment->price !== null
            ? (int) $appointment->price
            : (int) ($service->price ?? 0);

        /** @var SaleDocumentDetail|null $existing */
        $existing = SaleDocumentDetail::query()
            ->where('appointment_id', $appointment->id)
            ->lockForUpdate()
            ->first();

        if ($existing instanceof SaleDocumentDetail) {
            if (
                $existing->sale_document_id === $document->id
                && $document->status === SaleDocumentStatus::Draft
            ) {
                $existing->update([
                    'detail_type' => SaleDocumentDetailType::Service,
                    'service_id' => $service->id,
                    'product_id' => null,
                    'clinical_attention_id' => null,
                    'patient_vaccination_dose_id' => null,
                    'description' => $service->name,
                    'quantity' => 1,
                    'unit_price' => $unitPrice,
                    'tax_treatment' => TaxTreatment::Exempt,
                    'tax_percent' => 0,
                ]);
            }

            return;
        }

        $sort = (int) $document->details()->max('sort_order');

        SaleDocumentDetail::query()->create([
            'sale_document_id' => $document->id,
            'detail_type' => SaleDocumentDetailType::Service,
            'service_id' => $service->id,
            'product_id' => null,
            'clinical_attention_id' => null,
            'patient_vaccination_dose_id' => null,
            'appointment_id' => $appointment->id,
            'description' => $service->name,
            'quantity' => 1,
            'unit_price' => $unitPrice,
            'discount_percent' => 0,
            'discount_amount' => 0,
            'tax_treatment' => TaxTreatment::Exempt,
            'tax_percent' => 0,
            'gross_amount' => 0,
            'net_amount' => 0,
            'exempt_amount' => 0,
            'tax_amount' => 0,
            'detail_total' => 0,
            'sort_order' => $sort + 1,
        ]);
    }
}
