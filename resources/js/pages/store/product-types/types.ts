import type { TabledataListStandardDraft } from '@/components/custom/tabledata';
import {
    formatIsActive as formatIsActiveBase,
    isActiveFilterOptions,
} from '@/types/active-record';
import type { PaginatedListFilters } from '@/types/list-filters';

export type ProductType = {
    id: string;
    company_id: string | null;
    name: string;
    is_active: boolean;
    active_products_count: number;
    created_at: string;
    updated_at: string;
};

export const PRODUCT_TYPES_INDEX_MODULE_FILTER_KEYS = ['is_active'] as const;

export type ProductTypesIndexModuleFilterKey =
    (typeof PRODUCT_TYPES_INDEX_MODULE_FILTER_KEYS)[number];

export type ProductTypesIndexModuleFilters = {
    [K in ProductTypesIndexModuleFilterKey]: string;
};

export type ProductTypeListFilters = PaginatedListFilters & {
    [K in ProductTypesIndexModuleFilterKey]?: string | null;
};

export type ProductTypesIndexFiltersDraftFull =
    ProductTypesIndexModuleFilters & TabledataListStandardDraft;

export type ProductTypesIndexCan = {
    create: boolean;
    update: boolean;
    delete: boolean;
};

export const IS_ACTIVE_FILTER_OPTIONS = isActiveFilterOptions('m');

export function formatIsActive(value: boolean): string {
    return formatIsActiveBase(value, 'm');
}
