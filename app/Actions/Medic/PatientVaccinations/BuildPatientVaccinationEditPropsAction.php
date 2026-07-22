<?php

namespace App\Actions\Medic\PatientVaccinations;

use App\Models\Company;
use App\Models\Medic\Patient;
use App\Models\Medic\PatientVaccinationDose;
use App\Models\Medic\PatientVaccinationPlan;
use App\Models\Medic\VaccinationProtocol;
use App\Models\Store\Product;
use App\Models\Store\ProductCategory;
use App\Support\Medic\VaccinationDoseSchedule;

final class BuildPatientVaccinationEditPropsAction
{
    /**
     * @return array{
     *     vaccinationPlan: array{id: string, protocol_id: string, name: string, assigned_at: string}|null,
     *     vaccinationDoses: list<array{
     *         id: string,
     *         product_name: string,
     *         plan_name: string,
     *         status: string,
     *         source: string,
     *         administered_origin: string|null,
     *         series_label: string|null,
     *         scheduled_on: string,
     *         administered_on: string|null,
     *         notes: string|null,
     *         billing_status: string,
     *         appointment_id: string|null,
     *         appointment_starts_at: string|null,
     *         appointment_misaligned: bool
     *     }>,
     *     vaccinationProtocols: list<array{id: string, name: string}>,
     *     vaccineProducts: list<array{id: string, name: string}>
     * }
     */
    public function execute(Patient $patient, ?Company $company): array
    {
        $plan = PatientVaccinationPlan::query()
            ->where('patient_id', $patient->id)
            ->with([
                'doses.product:id,name',
                'doses.appointment:id,starts_at',
                'doses.saleDocumentDetail:id,patient_vaccination_dose_id,sale_document_id',
                'doses.saleDocumentDetail.saleDocument:id,status',
            ])
            ->first();

        $planName = is_array($plan?->protocol_snapshot)
            ? (string) ($plan->protocol_snapshot['name'] ?? 'Plan de vacunación')
            : 'Plan de vacunación';

        $doses = [];

        if ($plan instanceof PatientVaccinationPlan) {
            VaccinationDoseSchedule::syncOpenStatuses($plan->doses);

            $doses = $plan->doses
                ->sortByDesc(static function (PatientVaccinationDose $dose): string {
                    if ($dose->administered_on !== null) {
                        return $dose->administered_on->toIso8601String();
                    }

                    return $dose->scheduled_on->toDateString().'T00:00:00+00:00';
                })
                ->values()
                ->map(static fn (PatientVaccinationDose $dose): array => VaccinationDoseSchedule::toTimelineSummary(
                    $dose,
                    $planName,
                ))
                ->all();
        }

        return [
            'vaccinationPlan' => $plan instanceof PatientVaccinationPlan
                ? [
                    'id' => $plan->id,
                    'protocol_id' => $plan->protocol_id,
                    'name' => $planName,
                    'assigned_at' => $plan->assigned_at->toIso8601String(),
                ]
                : null,
            'vaccinationDoses' => $doses,
            'vaccinationProtocols' => $this->protocolOptions($patient, $company),
            'vaccineProducts' => $this->vaccineProductOptions($company),
        ];
    }

    /**
     * @return list<array{id: string, name: string}>
     */
    private function protocolOptions(Patient $patient, ?Company $company): array
    {
        if (! $company instanceof Company || $patient->species_id === null) {
            return [];
        }

        return VaccinationProtocol::query()
            ->forCompany($company->id)
            ->where('species_id', $patient->species_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(static fn (VaccinationProtocol $protocol): array => [
                'id' => $protocol->id,
                'name' => $protocol->name,
            ])
            ->all();
    }

    /**
     * @return list<array{id: string, name: string}>
     */
    private function vaccineProductOptions(?Company $company): array
    {
        if (! $company instanceof Company) {
            return [];
        }

        $categoryId = ProductCategory::query()
            ->whereNull('company_id')
            ->where('name', ProductCategory::GLOBAL_VACCINES_NAME)
            ->value('id');

        if (! is_string($categoryId) || $categoryId === '') {
            return [];
        }

        return Product::query()
            ->forCompany($company->id)
            ->where('product_category_id', $categoryId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(static fn (Product $product): array => [
                'id' => $product->id,
                'name' => $product->name,
            ])
            ->all();
    }
}
