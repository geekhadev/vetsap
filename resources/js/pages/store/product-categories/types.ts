import type { TabledataListStandardDraft } from '@/components/custom/tabledata';
import {
    formatIsActive as formatIsActiveBase,
    isActiveFilterOptions,
} from '@/types/active-record';
import type { PaginatedListFilters } from '@/types/list-filters';

export { isGlobalRecord } from '@/lib/store-master-record';

export type ProductCategory = {
    id: string;
    company_id: string | null;
    name: string;
    is_active: boolean;
    active_products_count: number;
    created_at: string;
    updated_at: string;
};

export const PRODUCT_CATEGORIES_INDEX_MODULE_FILTER_KEYS = ['is_active'] as const;

export type ProductCategoriesIndexModuleFilterKey =
    (typeof PRODUCT_CATEGORIES_INDEX_MODULE_FILTER_KEYS)[number];

export type ProductCategoriesIndexModuleFilters = {
    [K in ProductCategoriesIndexModuleFilterKey]: string;
};

export type ProductCategoryListFilters = PaginatedListFilters & {
    [K in ProductCategoriesIndexModuleFilterKey]?: string | null;
};

export type ProductCategoriesIndexFiltersDraftFull =
    ProductCategoriesIndexModuleFilters & TabledataListStandardDraft;

export type ProductCategoriesIndexCan = {
    create: boolean;
    update: boolean;
    delete: boolean;
};

export const IS_ACTIVE_FILTER_OPTIONS = isActiveFilterOptions('f');

export function formatIsActive(value: boolean): string {
    return formatIsActiveBase(value, 'f');
}
