import type { TabledataListStandardDraft } from '@/components/custom/tabledata';
import {
    formatIsActive as formatIsActiveBase,
    isActiveFilterOptions,
} from '@/types/active-record';
import type { PaginatedListFilters } from '@/types/list-filters';

export type ServiceSpecialtyRef = {
    id: string;
    name: string;
};

export type SpecialtyOption = {
    id: string;
    name: string;
    is_active: boolean;
};

export type Service = {
    id: string;
    company_id: string;
    specialty_id: string;
    name: string;
    description: string | null;
    price: string | null;
    duration_minutes: number | null;
    is_active: boolean;
    is_public_booking: boolean;
    specialty?: ServiceSpecialtyRef;
    created_at: string;
    updated_at: string;
};

export const SERVICES_INDEX_MODULE_FILTER_KEYS = [
    'is_active',
    'specialty_id',
] as const;

export type ServicesIndexModuleFilterKey =
    (typeof SERVICES_INDEX_MODULE_FILTER_KEYS)[number];

export type ServicesIndexModuleFilters = {
    [K in ServicesIndexModuleFilterKey]: string;
};

export type ServiceListFilters = PaginatedListFilters & {
    [K in ServicesIndexModuleFilterKey]?: string | null;
};

export type ServicesIndexFiltersDraftFull =
    ServicesIndexModuleFilters & TabledataListStandardDraft;

export type ServicesIndexCan = {
    create: boolean;
    update: boolean;
    delete: boolean;
};

export const IS_ACTIVE_FILTER_OPTIONS = isActiveFilterOptions('m');

export function formatIsActive(value: boolean): string {
    return formatIsActiveBase(value, 'm');
}

export function formatPublicBooking(value: boolean): string {
    return value ? 'Sí' : 'No';
}

export function formatPrice(price: string | null): string {
    if (price === null || price === '') {
        return 'Consultar precio';
    }

    const amount = Number(price);

    if (Number.isNaN(amount)) {
        return 'Consultar precio';
    }

    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatDuration(minutes: number | null): string {
    if (minutes === null) {
        return '—';
    }

    return `${minutes} min`;
}
