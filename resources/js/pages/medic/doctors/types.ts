import type { TabledataListStandardDraft } from '@/components/custom/tabledata';
import {
    formatIsActive as formatIsActiveBase,
    isActiveFilterOptions,
} from '@/types/active-record';
import type { PaginatedListFilters } from '@/types/list-filters';

export type DoctorDocumentTypeValue = 'rut' | 'pasaporte';

export type DoctorServicePivot = {
    doctor_id: string;
    service_id: string;
    duration_override_minutes: number | null;
};

export type DoctorServiceAssignment = {
    id: string;
    name: string;
    duration_minutes: number | null;
    pivot: DoctorServicePivot;
};

export type ServiceOption = {
    id: string;
    name: string;
    duration_minutes: number | null;
    specialty_id: string;
};

export type Doctor = {
    id: string;
    company_id: string;
    document_type: DoctorDocumentTypeValue;
    document_number: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    email: string | null;
    is_active: boolean;
    use_web: boolean;
    services?: DoctorServiceAssignment[];
    services_count?: number;
    created_at: string;
    updated_at: string;
};

export const DOCTORS_INDEX_MODULE_FILTER_KEYS = ['is_active'] as const;

export type DoctorsIndexModuleFilterKey =
    (typeof DOCTORS_INDEX_MODULE_FILTER_KEYS)[number];

export type DoctorsIndexModuleFilters = {
    [K in DoctorsIndexModuleFilterKey]: string;
};

export type DoctorListFilters = PaginatedListFilters & {
    [K in DoctorsIndexModuleFilterKey]?: string | null;
};

export type DoctorsIndexFiltersDraftFull =
    DoctorsIndexModuleFilters & TabledataListStandardDraft;

export type DoctorsIndexCan = {
    create: boolean;
    update: boolean;
    delete: boolean;
};

export const DOCUMENT_TYPE_OPTIONS = [
    { id: 'rut', label: 'RUT' },
    { id: 'pasaporte', label: 'Pasaporte' },
] as const;

export const IS_ACTIVE_FILTER_OPTIONS = isActiveFilterOptions('m');

export function formatIsActive(value: boolean): string {
    return formatIsActiveBase(value, 'm');
}

export function formatUseWeb(value: boolean): string {
    return value ? 'Sí' : 'No';
}

export function formatDocumentType(value: DoctorDocumentTypeValue): string {
    if (value === 'rut') {
        return 'RUT';
    }

    return 'Pasaporte';
}

export function formatDoctorName(doctor: Pick<Doctor, 'first_name' | 'last_name'>): string {
    return `${doctor.first_name} ${doctor.last_name}`.trim();
}
