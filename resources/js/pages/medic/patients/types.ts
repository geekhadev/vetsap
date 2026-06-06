import type { TabledataListStandardDraft } from '@/components/custom/tabledata';
import {
    formatIsActive as formatIsActiveBase,
    isActiveFilterOptions,
} from '@/types/active-record';
import type { PaginatedListFilters } from '@/types/list-filters';

export type PatientSexValue = 'male' | 'female' | 'unknown';

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
    is_active: boolean;
    species?: PatientSpeciesRef | null;
    customer?: PatientCustomerRef | null;
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
};

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
    const option = SEX_OPTIONS.find((item) => item.id === value);

    return option?.label ?? value;
}

export function formatSterilized(value: boolean): string {
    return value ? 'Esterilizado' : 'No esterilizado';
}

export function formatCustomerLabel(customer: PatientCustomerRef): string {
    return `${customer.name} (${customer.document_number})`;
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
