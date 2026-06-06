import type { TabledataListStandardDraft } from '@/components/custom/tabledata';
import {
    formatIsActive as formatIsActiveBase,
    isActiveFilterOptions,
} from '@/types/active-record';
import type { PaginatedListFilters } from '@/types/list-filters';

export type Species = {
    id: string;
    company_id: string;
    name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export const SPECIES_INDEX_MODULE_FILTER_KEYS = ['is_active'] as const;

export type SpeciesIndexModuleFilterKey =
    (typeof SPECIES_INDEX_MODULE_FILTER_KEYS)[number];

export type SpeciesIndexModuleFilters = {
    [K in SpeciesIndexModuleFilterKey]: string;
};

export type SpeciesListFilters = PaginatedListFilters & {
    [K in SpeciesIndexModuleFilterKey]?: string | null;
};

export type SpeciesIndexFiltersDraftFull =
    SpeciesIndexModuleFilters & TabledataListStandardDraft;

export type SpeciesIndexCan = {
    create: boolean;
    update: boolean;
    delete: boolean;
};

export const IS_ACTIVE_FILTER_OPTIONS = isActiveFilterOptions('f');

export function formatIsActive(value: boolean): string {
    return formatIsActiveBase(value, 'f');
}
