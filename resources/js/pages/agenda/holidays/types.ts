import type { TabledataListStandardDraft } from '@/components/custom/tabledata';
import {
    formatIsActive as formatIsActiveBase,
    isActiveFilterOptions,
} from '@/types/active-record';
import type { PaginatedListFilters } from '@/types/list-filters';

export type Holiday = {
    id: string;
    company_id: string;
    name: string;
    date: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export const HOLIDAYS_INDEX_MODULE_FILTER_KEYS = ['is_active'] as const;

export type HolidaysIndexModuleFilterKey =
    (typeof HOLIDAYS_INDEX_MODULE_FILTER_KEYS)[number];

export type HolidaysIndexModuleFilters = {
    [K in HolidaysIndexModuleFilterKey]: string;
};

export type HolidaysListFilters = PaginatedListFilters & {
    [K in HolidaysIndexModuleFilterKey]?: string | null;
};

export type HolidaysIndexFiltersDraftFull =
    HolidaysIndexModuleFilters & TabledataListStandardDraft;

export type HolidaysIndexCan = {
    create: boolean;
    update: boolean;
    delete: boolean;
};

export const IS_ACTIVE_FILTER_OPTIONS = isActiveFilterOptions('m');

export function formatIsActive(value: boolean): string {
    return formatIsActiveBase(value, 'm');
}
