<?php

namespace App\Actions\Customer\Pets;

use App\Actions\Medic\PatientVaccinations\BuildPatientVaccinationEditPropsAction;
use App\Enums\Medic\ClinicalAttentionStatus;
use App\Models\Agenda\Appointment;
use App\Models\Company;
use App\Models\Medic\ClinicalAttention;
use App\Models\Medic\Patient;
use App\Models\Medic\Service;
use App\Models\Sale\Customer;
use App\Models\User;
use App\Support\Storage\PublicStorageUrl;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final class BuildCustomerPetTimelineAction
{
    public function __construct(
        private BuildPatientVaccinationEditPropsAction $buildVaccinationProps,
    ) {}

    /**
     * Timeline clínico del paciente (como en gestionar paciente), sin borradores ni opciones de creación.
     *
     * @return array{
     *     attentions: list<array<string, mixed>>,
     *     appointments: list<array<string, mixed>>,
     *     vaccinationDoses: list<array<string, mixed>>
     * }
     */
    public function execute(User $user, Patient $patient, ?string $companyId = null): array
    {
        $customer = Customer::query()
            ->where('user_id', $user->id)
            ->where('id', $patient->customer_id)
            ->when(
                is_string($companyId) && $companyId !== '',
                fn ($query) => $query->where('company_id', $companyId),
            )
            ->first();

        if (! $customer instanceof Customer) {
            throw new NotFoundHttpException;
        }

        $attentions = ClinicalAttention::query()
            ->where('patient_id', $patient->id)
            ->where('status', ClinicalAttentionStatus::Closed)
            ->with([
                'template:id,name',
                'doctor:id,first_name,last_name',
                'values',
                'requestedServices:id,name',
                'documentTemplates:id,title',
            ])
            ->orderByDesc('closed_at')
            ->orderByDesc('started_at')
            ->get();

        $linkedAppointmentIds = $attentions
            ->pluck('appointment_id')
            ->filter()
            ->unique()
            ->values()
            ->all();

        $appointments = Appointment::query()
            ->where('patient_id', $patient->id)
            ->whereHas(
                'appointmentStatus',
                static fn ($query) => $query->where('is_terminal', false),
            )
            ->when(
                $linkedAppointmentIds !== [],
                static fn ($query) => $query->whereNotIn('id', $linkedAppointmentIds),
            )
            ->with([
                'service:id,name',
                'doctor:id,first_name,last_name',
                'appointmentStatus:id,name',
            ])
            ->orderByDesc('starts_at')
            ->get();

        $company = Company::query()->find($customer->company_id);
        $vaccinationProps = $this->buildVaccinationProps->execute(
            $patient,
            $company instanceof Company ? $company : null,
        );

        return [
            'attentions' => $attentions
                ->map(fn (ClinicalAttention $attention): array => $this->mapAttention($attention))
                ->values()
                ->all(),
            'appointments' => $appointments
                ->map(static fn (Appointment $appointment): array => [
                    'id' => $appointment->id,
                    'service_name' => $appointment->service?->name,
                    'doctor_name' => $appointment->doctor
                        ? "{$appointment->doctor->first_name} {$appointment->doctor->last_name}"
                        : null,
                    'starts_at' => $appointment->starts_at,
                    'ends_at' => $appointment->ends_at,
                    'status_name' => $appointment->appointmentStatus?->name,
                ])
                ->values()
                ->all(),
            'vaccinationDoses' => $vaccinationProps['vaccinationDoses'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function mapAttention(ClinicalAttention $attention): array
    {
        return [
            'id' => $attention->id,
            'status' => $attention->status instanceof ClinicalAttentionStatus
                ? $attention->status->value
                : (string) $attention->status,
            'template_id' => $attention->template_id,
            'template_name' => $attention->template?->name,
            'doctor_name' => $attention->doctor
                ? "{$attention->doctor->first_name} {$attention->doctor->last_name}"
                : null,
            'started_at' => $attention->started_at,
            'closed_at' => $attention->closed_at,
            'created_at' => $attention->created_at,
            'values' => $attention->values
                ->mapWithKeys(static fn ($value): array => [
                    $value->field_key => $value->value,
                ])
                ->all(),
            'requested_exams' => $attention->requestedServices
                ->map(static function (Service $service): array {
                    $path = $service->pivot->result_path ?? null;
                    $isUploaded = is_string($path) && $path !== '';

                    return [
                        'id' => $service->id,
                        'name' => $service->name,
                        'is_uploaded' => $isUploaded,
                        'file_url' => $isUploaded
                            ? PublicStorageUrl::fromRelativePath($path)
                            : null,
                        'file_name' => $isUploaded
                            ? ($service->pivot->result_original_name ?: null)
                            : null,
                        'mime_type' => $isUploaded
                            ? ($service->pivot->result_mime_type ?: null)
                            : null,
                    ];
                })
                ->values()
                ->all(),
            'document_templates' => $attention->documentTemplates
                ->map(static fn ($template): array => [
                    'id' => $template->id,
                    'title' => $template->title,
                ])
                ->values()
                ->all(),
        ];
    }
}
