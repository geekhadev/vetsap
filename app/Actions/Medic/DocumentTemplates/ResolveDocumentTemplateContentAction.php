<?php

namespace App\Actions\Medic\DocumentTemplates;

use App\Enums\Medic\ClinicalAttentionStatus;
use App\Enums\Medic\PatientSex;
use App\Models\Medic\ClinicalAttention;
use App\Models\Medic\DocumentTemplate;
use App\Models\Sale\Customer;
use Carbon\CarbonInterface;

final class ResolveDocumentTemplateContentAction
{
    public function execute(ClinicalAttention $attention, DocumentTemplate $template): string
    {
        $attention->loadMissing([
            'company',
            'patient.species',
            'patient.customer',
            'doctor',
            'appointment.appointmentStatus',
            'appointment.doctor',
            'appointment.service',
            'appointment.office',
        ]);

        $values = $this->buildVariableValues($attention);

        return $this->replaceVariables($template->content, $values);
    }

    /**
     * @return array<string, string>
     */
    protected function buildVariableValues(ClinicalAttention $attention): array
    {
        $patient = $attention->patient;
        $company = $attention->company;
        $customer = $patient?->customer;
        $doctor = $attention->doctor;
        $appointment = $attention->appointment;
        $now = now()->timezone(config('app.timezone'));

        $doctorName = $doctor
            ? trim("{$doctor->first_name} {$doctor->last_name}")
            : '';

        $appointmentDoctor = $appointment?->doctor;
        $appointmentDoctorName = $appointmentDoctor
            ? trim("{$appointmentDoctor->first_name} {$appointmentDoctor->last_name}")
            : '';

        return [
            'paciente.nombre' => (string) ($patient?->name ?? ''),
            'paciente.ficha' => (string) ($patient?->record_number ?? ''),
            'paciente.especie' => (string) ($patient?->species?->name ?? ''),
            'paciente.raza' => (string) ($patient?->breed ?? ''),
            'paciente.sexo' => $this->formatPatientSex($patient?->sex),
            'paciente.fecha_nacimiento' => $this->formatDate($patient?->birth_date),
            'paciente.peso' => $patient?->weight_kg !== null ? (string) $patient->weight_kg : '',
            'paciente.microchip' => (string) ($patient?->microchip_number ?? ''),
            'paciente.colores' => (string) ($patient?->colors ?? ''),
            'paciente.esterilizado' => $patient?->is_sterilized === null
                ? ''
                : ($patient->is_sterilized ? 'Sí' : 'No'),

            'clinica.nombre' => (string) ($company?->name ?? ''),
            'clinica.alias' => (string) ($company?->alias ?? ''),
            'clinica.documento' => (string) ($company?->document_number ?? ''),
            'clinica.email' => (string) ($company?->email ?? ''),
            'clinica.telefono' => (string) ($company?->phone ?? ''),
            'clinica.direccion' => (string) ($company?->address ?? ''),

            'cliente.nombre' => (string) ($customer?->name ?? ''),
            'cliente.documento' => $this->formatCustomerDocument($customer),
            'cliente.email' => (string) ($customer?->email ?? ''),
            'cliente.telefono' => (string) ($customer?->phone ?? ''),
            'cliente.direccion' => (string) ($customer?->address ?? ''),

            'atencion.estado' => $this->formatAttentionStatus($attention->status),
            'atencion.fecha_inicio' => $this->formatDate($attention->started_at),
            'atencion.hora_inicio' => $this->formatTime($attention->started_at),
            'atencion.fecha_cierre' => $this->formatDate($attention->closed_at),
            'atencion.hora_cierre' => $this->formatTime($attention->closed_at),
            'atencion.doctor' => $doctorName,

            'cita.fecha' => $this->formatDate($appointment?->starts_at),
            'cita.hora_inicio' => $this->formatTime($appointment?->starts_at),
            'cita.hora_fin' => $this->formatTime($appointment?->ends_at),
            'cita.estado' => (string) ($appointment?->appointmentStatus?->name ?? ''),
            'cita.doctor' => $appointmentDoctorName,
            'cita.servicio' => (string) ($appointment?->service?->name ?? ''),
            'cita.sucursal' => (string) ($appointment?->office?->name ?? ''),
            'cita.notas' => (string) ($appointment?->notes ?? ''),

            'sistema.fecha' => $now->format('d/m/Y'),
            'sistema.hora' => $now->format('H:i'),
            'sistema.fecha_hora' => $now->format('d/m/Y H:i'),
        ];
    }

    /**
     * @param  array<string, string>  $values
     */
    protected function replaceVariables(string $html, array $values): string
    {
        $replaced = preg_replace_callback(
            '/<span\b(?=[^>]*\bdata-type="mention")(?=[^>]*\bdata-id="([^"]+)")[^>]*>.*?<\/span>/si',
            static function (array $matches) use ($values): string {
                $id = $matches[1];
                $value = $values[$id] ?? '@'.$id;

                return e($value);
            },
            $html,
        );

        return is_string($replaced) ? $replaced : $html;
    }

    protected function formatPatientSex(mixed $sex): string
    {
        if (! $sex instanceof PatientSex) {
            return '';
        }

        return match ($sex) {
            PatientSex::Male => 'Macho',
            PatientSex::Female => 'Hembra',
            PatientSex::Unknown => 'Desconocido',
        };
    }

    protected function formatAttentionStatus(mixed $status): string
    {
        if (! $status instanceof ClinicalAttentionStatus) {
            return is_string($status) ? $status : '';
        }

        return match ($status) {
            ClinicalAttentionStatus::Draft => 'Borrador',
            ClinicalAttentionStatus::Closed => 'Cerrada',
        };
    }

    protected function formatCustomerDocument(?Customer $customer): string
    {
        if ($customer === null) {
            return '';
        }

        $type = $customer->document_type;
        $number = (string) ($customer->document_number ?? '');

        if ($number === '') {
            return '';
        }

        $typeLabel = is_object($type) && property_exists($type, 'value')
            ? strtoupper((string) $type->value)
            : (is_string($type) ? strtoupper($type) : '');

        return trim($typeLabel !== '' ? "{$typeLabel} {$number}" : $number);
    }

    protected function formatDate(mixed $value): string
    {
        if ($value instanceof CarbonInterface) {
            return $value->timezone(config('app.timezone'))->format('d/m/Y');
        }

        return '';
    }

    protected function formatTime(mixed $value): string
    {
        if ($value instanceof CarbonInterface) {
            return $value->timezone(config('app.timezone'))->format('H:i');
        }

        return '';
    }
}
