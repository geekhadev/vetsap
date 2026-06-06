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
    price_override: string | null;
};

export type DoctorScheduleDayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type DoctorScheduleBlock = {
    id: string;
    doctor_id: string;
    day_of_week: DoctorScheduleDayOfWeek;
    starts_at: string;
    ends_at: string;
    sort_order: number;
};

export const SCHEDULE_DAYS = [
    { value: 1 as DoctorScheduleDayOfWeek, label: 'Lunes', shortLabel: 'Lun' },
    { value: 2 as DoctorScheduleDayOfWeek, label: 'Martes', shortLabel: 'Mar' },
    { value: 3 as DoctorScheduleDayOfWeek, label: 'Miércoles', shortLabel: 'Mié' },
    { value: 4 as DoctorScheduleDayOfWeek, label: 'Jueves', shortLabel: 'Jue' },
    { value: 5 as DoctorScheduleDayOfWeek, label: 'Viernes', shortLabel: 'Vie' },
    { value: 6 as DoctorScheduleDayOfWeek, label: 'Sábado', shortLabel: 'Sáb' },
    { value: 7 as DoctorScheduleDayOfWeek, label: 'Domingo', shortLabel: 'Dom' },
] as const;

export type DoctorServiceAssignment = {
    id: string;
    name: string;
    duration_minutes: number | null;
    price: string | null;
    pivot: DoctorServicePivot;
};

export type ServiceOptionSpecialtyRef = {
    id: string;
    name: string;
};

export type ServiceOption = {
    id: string;
    name: string;
    duration_minutes: number | null;
    price: string | null;
    specialty_id: string;
    specialty?: ServiceOptionSpecialtyRef | null;
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
    schedule_blocks?: DoctorScheduleBlock[];
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

export function formatServicesCount(count: number | undefined): string {
    const value = count ?? 0;

    return value === 1 ? '1 servicio' : `${value} servicios`;
}

export function hasDoctorServicesConfigured(
    doctor: Pick<Doctor, 'services_count' | 'services'>,
): boolean {
    return (doctor.services_count ?? doctor.services?.length ?? 0) > 0;
}

export function hasDoctorScheduleConfigured(
    doctor: Pick<Doctor, 'schedule_blocks'>,
): boolean {
    return (doctor.schedule_blocks?.length ?? 0) > 0;
}
