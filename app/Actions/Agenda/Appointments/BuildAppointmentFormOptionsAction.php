<?php

namespace App\Actions\Agenda\Appointments;

use App\Models\CompanyOffice;
use App\Models\Medic\Doctor;
use App\Models\Medic\Patient;
use App\Models\Medic\Service;

final class BuildAppointmentFormOptionsAction
{
    /**
     * @return array{
     *     doctors: list<array{id: string, label: string, service_ids: list<string>}>,
     *     services: list<array{id: string, label: string, duration_minutes: int|null, price: string|null}>,
     *     patients: list<array{id: string, label: string, customer_id: string, search_text: string}>,
     *     offices: list<array{id: string, label: string}>,
     * }
     */
    public function execute(string $companyId): array
    {
        $doctors = Doctor::query()
            ->forCompany($companyId)
            ->where('is_active', true)
            ->with(['services:id'])
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get(['id', 'first_name', 'last_name'])
            ->map(static fn (Doctor $doctor): array => [
                'id' => $doctor->id,
                'label' => trim(sprintf('%s %s', $doctor->first_name, $doctor->last_name)),
                'service_ids' => $doctor->services->pluck('id')->map(fn ($id): string => (string) $id)->values()->all(),
            ])
            ->values()
            ->all();

        $services = Service::query()
            ->forCompany($companyId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'duration_minutes', 'price'])
            ->map(static fn (Service $service): array => [
                'id' => $service->id,
                'label' => $service->name,
                'duration_minutes' => $service->duration_minutes !== null ? (int) $service->duration_minutes : null,
                'price' => $service->price !== null ? (string) $service->price : null,
            ])
            ->values()
            ->all();

        $patients = Patient::query()
            ->forCompany($companyId)
            ->where('is_active', true)
            ->with(['customer:id,name,document_number,phone'])
            ->orderBy('name')
            ->get(['id', 'name', 'record_number', 'customer_id'])
            ->map(static function (Patient $patient): array {
                $customer = $patient->customer;
                $customerName = $customer?->name ?? 'Sin cliente';
                $documentNumber = $customer?->document_number ?? '';
                $phone = $customer?->phone ?? '';

                return [
                    'id' => $patient->id,
                    'customer_id' => (string) $patient->customer_id,
                    'label' => sprintf(
                        '%s · %s — %s',
                        $patient->name,
                        $patient->record_number,
                        $customerName,
                    ),
                    'search_text' => implode(' ', array_filter([
                        $patient->name,
                        $patient->record_number,
                        $customerName,
                        $documentNumber,
                        $phone,
                    ])),
                ];
            })
            ->values()
            ->all();

        $offices = CompanyOffice::query()
            ->where('company_id', $companyId)
            ->orderByDesc('is_main')
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(static fn (CompanyOffice $office): array => [
                'id' => $office->id,
                'label' => $office->name,
            ])
            ->values()
            ->all();

        return [
            'doctors' => $doctors,
            'services' => $services,
            'patients' => $patients,
            'offices' => $offices,
        ];
    }
}
