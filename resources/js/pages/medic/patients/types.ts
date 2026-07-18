import type { CalendarHoliday } from '@/components/custom/full-calendar/types';
import type { PatientSexValue } from '@/components/custom/patient-sex-badge';
import { formatPatientSexLabel } from '@/components/custom/patient-sex-badge';
import type { TabledataListStandardDraft } from '@/components/custom/tabledata';
import type {
    AppointmentFormOptions,
    AppointmentStatusOption,
} from '@/pages/agenda/calendar/types';
import type { ClinicalAttention } from '@/pages/medic/clinical-attentions/types';
import type { ClinicalTemplate } from '@/pages/medic/clinical-templates/types';
import {
    formatIsActive as formatIsActiveBase,
    isActiveFilterOptions,
} from '@/types/active-record';
import type { PaginatedListFilters } from '@/types/list-filters';

export type { PatientSexValue } from '@/components/custom/patient-sex-badge';

export type PatientSpeciesRef = {
    id: string;
    name: string;
};

export type PatientCustomerRef = {
    id: string;
    name: string;
    document_type: 'rut' | 'pasaporte';
    document_number: string;
};

export type PatientCustomerDetail = PatientCustomerRef & {
    email: string | null;
    phone: string | null;
    address: string | null;
};

export type Patient = {
    id: string;
    company_id: string;
    customer_id: string;
    species_id: string;
    record_number: string;
    name: string;
    breed: string | null;
    sex: PatientSexValue;
    birth_date: string | null;
    weight_kg: string | null;
    is_sterilized: boolean;
    colors: string | null;
    blood_type: string | null;
    microchip_number: string | null;
    photo_path?: string | null;
    photo_url?: string | null;
    is_active: boolean;
    species?: PatientSpeciesRef | null;
    customer?: PatientCustomerDetail | null;
    created_at: string;
    updated_at: string;
};

export type SpeciesOption = {
    id: string;
    name: string;
};

export type CustomerOption = {
    id: string;
    name: string;
    document_type: 'rut' | 'pasaporte';
    document_number: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
};

export type PatientTemplateOption = {
    id: string;
    name: string;
    is_default: boolean;
    fields: ClinicalTemplate['fields'];
};

export type PatientDoctorOption = {
    id: string;
    first_name: string;
    last_name: string;
};

export type AttentionStatus = 'draft' | 'closed';

export type AttentionRequestedExam = {
    id: string;
    name: string;
    is_uploaded: boolean;
    file_url: string | null;
    file_name: string | null;
    mime_type: string | null;
};

export type AttentionSummary = {
    id: string;
    status: AttentionStatus;
    template_id: string;
    template_name: string | null;
    doctor_name: string | null;
    started_at: string;
    closed_at: string | null;
    created_at: string;
    values: Record<string, unknown>;
    requested_exams: AttentionRequestedExam[];
};

export type PatientAppointmentSummary = {
    id: string;
    service_name: string | null;
    doctor_name: string | null;
    starts_at: string;
    ends_at: string | null;
    status_name: string | null;
};

export type ExamServiceOption = {
    id: string;
    name: string;
};

export type PatientsEditCan = {
    attentions: {
        create: boolean;
        update: boolean;
        delete: boolean;
    };
    appointments: {
        create: boolean;
        update: boolean;
        delete: boolean;
    };
};

export type PatientsEditPageProps = {
    patient: Patient;
    redirectTo: 'patients' | 'customers';
    activeTab: PatientEditTabId;
    draftAttention: ClinicalAttention | null;
    species: SpeciesOption[];
    customers: CustomerOption[];
    templates: PatientTemplateOption[];
    doctors: PatientDoctorOption[];
    examServices: ExamServiceOption[];
    attentions: AttentionSummary[];
    appointments: PatientAppointmentSummary[];
    appointmentFormOptions: AppointmentFormOptions;
    appointmentHolidays: CalendarHoliday[];
    appointmentStatuses: AppointmentStatusOption[];
    can: PatientsEditCan;
};

export type PatientEditTabId = 'historial' | 'nueva-atencion';

export const PATIENTS_INDEX_MODULE_FILTER_KEYS = ['is_active', 'species_id', 'customer_id'] as const;

export type PatientsIndexModuleFilterKey =
    (typeof PATIENTS_INDEX_MODULE_FILTER_KEYS)[number];

export type PatientsIndexModuleFilters = {
    [K in PatientsIndexModuleFilterKey]: string;
};

export type PatientListFilters = PaginatedListFilters & {
    [K in PatientsIndexModuleFilterKey]?: string | null;
};

export type PatientsIndexFiltersDraftFull =
    PatientsIndexModuleFilters & TabledataListStandardDraft;

export type PatientsIndexCan = {
    create: boolean;
    update: boolean;
    delete: boolean;
};

export const SEX_OPTIONS = [
    { id: 'male', label: 'Macho' },
    { id: 'female', label: 'Hembra' },
    { id: 'unknown', label: 'Desconocido' },
] as const;

export const IS_ACTIVE_FILTER_OPTIONS = isActiveFilterOptions('m');

export function formatIsActive(value: boolean): string {
    return formatIsActiveBase(value, 'm');
}

export function formatSex(value: PatientSexValue): string {
    return formatPatientSexLabel(value);
}

export function formatSterilized(value: boolean): string {
    return value ? 'Esterilizado' : 'No esterilizado';
}

export function formatCustomerLabel(customer: PatientCustomerRef): string {
    return `${customer.name} (${customer.document_number})`;
}

export function formatSpeciesAndBreed(
    species: PatientSpeciesRef | null | undefined,
    breed: string | null,
): string {
    const speciesName = species?.name?.trim() ?? '';
    const breedName = breed?.trim() ?? '';

    if (speciesName === '' && breedName === '') {
        return '—';
    }

    if (speciesName === '') {
        return breedName;
    }

    if (breedName === '') {
        return speciesName;
    }

    return `${speciesName} · ${breedName}`;
}

export function hasCustomerPatientsConfigured(
    customer: Pick<CustomerWithPatients, 'patients_count' | 'patients'>,
): boolean {
    return (customer.patients_count ?? customer.patients?.length ?? 0) > 0;
}

export function formatPatientsCount(count: number | undefined): string {
    const value = count ?? 0;

    return value === 1 ? '1 paciente' : `${value} pacientes`;
}

export type CustomerWithPatients = {
    patients?: Patient[];
    patients_count?: number;
};
