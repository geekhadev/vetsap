import { Pencil } from 'lucide-react';
import { DocumentBadge } from '@/components/custom/document-badge';
import { InfoItem } from '@/components/custom/info-item';
import { PatientRecordBadge } from '@/components/custom/patient-record-badge';
import { PatientSexBadge } from '@/components/custom/patient-sex-badge';
import { SplitSettingsAside } from '@/components/custom/split-settings-layout';
import { Button } from '@/components/ui/button';
import {
    DISPLAY_EMPTY,
    formatBirthDate,
    formatOptionalText,
    formatOptionalWithSuffix,
} from '@/lib/format-display';
import { SettingsSection } from '@/pages/configuration/calendar-settings/settings-section';
import {
    formatSpeciesAndBreed,
    formatSterilized,
} from '@/pages/medic/patients/types';
import type { Patient } from '@/pages/medic/patients/types';

type PatientEditSidebarProps = {
    patient: Patient;
    onEdit: () => void;
};

export function PatientEditSidebar({ patient, onEdit }: PatientEditSidebarProps) {
    const customer = patient.customer;

    return (
        <SplitSettingsAside>
            <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">{patient.name}</h1>
                        <PatientRecordBadge recordNumber={patient.record_number} />
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8 shrink-0"
                        title="Editar paciente"
                        onClick={onEdit}
                    >
                        <Pencil className="size-4" aria-hidden />
                        <span className="sr-only">Editar paciente</span>
                    </Button>
                </div>
                <p className="text-muted-foreground text-sm">
                    Gestiona la ficha clínica del paciente y su tutor.
                </p>
            </div>

            <SettingsSection
                title="Datos del paciente"
                showSeparator={false}
                tooltip="Información clínica e identificación del paciente."
            >
                <dl className="grid grid-cols-2 gap-3">
                    <InfoItem label="Especie / Raza">
                        {formatSpeciesAndBreed(patient.species, patient.breed)}
                    </InfoItem>
                    <InfoItem label="Sexo">
                        <PatientSexBadge sex={patient.sex} />
                    </InfoItem>
                    <InfoItem label="Fecha de nacimiento">
                        {formatBirthDate(patient.birth_date)}
                    </InfoItem>
                    <InfoItem label="Peso">
                        {formatOptionalWithSuffix(patient.weight_kg, 'kg')}
                    </InfoItem>
                    <InfoItem label="Colores">{formatOptionalText(patient.colors)}</InfoItem>
                    <InfoItem label="Tipo sanguíneo">{formatOptionalText(patient.blood_type)}</InfoItem>
                    <InfoItem label="Número de chip">
                        {formatOptionalText(patient.microchip_number)}
                    </InfoItem>
                    <InfoItem label="Esterilizado">
                        {formatSterilized(patient.is_sterilized)}
                    </InfoItem>
                </dl>
            </SettingsSection>

            <SettingsSection title="Tutor (cliente)" tooltip="Persona responsable del paciente.">
                <dl className="grid grid-cols-2 gap-3">
                    <InfoItem label="Nombre">{formatOptionalText(customer?.name)}</InfoItem>
                    <InfoItem label="Documento">
                        {customer ? (
                            <DocumentBadge
                                documentType={customer.document_type}
                                documentNumber={customer.document_number}
                            />
                        ) : (
                            DISPLAY_EMPTY
                        )}
                    </InfoItem>
                    <InfoItem label="Teléfono">{formatOptionalText(customer?.phone)}</InfoItem>
                    <InfoItem label="Correo" className="col-span-2">
                        {formatOptionalText(customer?.email)}
                    </InfoItem>
                    <InfoItem label="Dirección" className="col-span-2">
                        {formatOptionalText(customer?.address)}
                    </InfoItem>
                </dl>
            </SettingsSection>
        </SplitSettingsAside>
    );
}
