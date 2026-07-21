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
    tax_treatment: 'exempt';
    duration_minutes: number | null;
    is_active: boolean;
    use_web: boolean;
    is_default: boolean;
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

export function formatUseWeb(value: boolean): string {
    return value ? 'Sí' : 'No';
}

export function formatDuration(minutes: number | null): string {
    if (minutes === null) {
        return '—';
    }

    return `${minutes} min`;
}

export function formatServiceDuration(
    minutes: number | null,
    timeBlockMinutes: number,
): string {
    if (minutes === null) {
        return '—';
    }

    if (
        timeBlockMinutes > 0 &&
        minutes % timeBlockMinutes === 0
    ) {
        const blocks = minutes / timeBlockMinutes;
        const blockLabel = blocks === 1 ? '1 bloque' : `${blocks} bloques`;

        return `${blockLabel} (${minutes} min)`;
    }

    return formatDuration(minutes);
}
