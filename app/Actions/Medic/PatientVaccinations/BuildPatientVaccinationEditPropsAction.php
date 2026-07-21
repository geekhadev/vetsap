<?php

namespace App\Actions\Medic\PatientVaccinations;

use App\Models\Company;
use App\Models\Medic\Patient;
use App\Models\Medic\PatientVaccinationDose;
use App\Models\Medic\PatientVaccinationPlan;
use App\Models\Medic\VaccinationProtocol;
use App\Models\Store\Product;
use App\Models\Store\ProductType;
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
     *         notes: string|null
     *     }>,
     *     vaccinationProtocols: list<array{id: string, name: string}>,
     *     vaccineProducts: list<array{id: string, name: string}>
     * }
     */
    public function execute(Patient $patient, ?Company $company): array
    {
        $plan = PatientVaccinationPlan::query()
            ->where('patient_id', $patient->id)
            ->with(['doses.product:id,name'])
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

        $typeId = ProductType::query()
            ->whereNull('company_id')
            ->where('name', ProductType::GLOBAL_VACCINES_NAME)
            ->value('id');

        if (! is_string($typeId) || $typeId === '') {
            return [];
        }

        return Product::query()
            ->forCompany($company->id)
            ->where('product_type_id', $typeId)
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
