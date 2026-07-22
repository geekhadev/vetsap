import type { TabledataListStandardDraft } from '@/components/custom/tabledata';
import {
    formatIsActive as formatIsActiveBase,
    isActiveFilterOptions,
} from '@/types/active-record';
import type { PaginatedListFilters } from '@/types/list-filters';

export type MasterOption = {
    id: string;
    name: string;
    is_active: boolean;
    is_global: boolean;
};

export type ProductCategoryRef = {
    id: string;
    name: string;
    company_id: string | null;
};

export type Product = {
    id: string;
    company_id: string;
    product_category_id: string;
    name: string;
    barcode: string | null;
    description: string | null;
    price: string | null;
    tax_treatment: 'taxable' | 'exempt';
    stock: number;
    is_active: boolean;
    product_category?: ProductCategoryRef;
    created_at: string;
    updated_at: string;
};

export const PRODUCTS_INDEX_MODULE_FILTER_KEYS = [
    'is_active',
    'product_category_id',
] as const;

export type ProductsIndexModuleFilterKey =
    (typeof PRODUCTS_INDEX_MODULE_FILTER_KEYS)[number];

export type ProductsIndexModuleFilters = {
    [K in ProductsIndexModuleFilterKey]: string;
};

export type ProductListFilters = PaginatedListFilters & {
    [K in ProductsIndexModuleFilterKey]?: string | null;
};

export type ProductsIndexFiltersDraftFull =
    ProductsIndexModuleFilters & TabledataListStandardDraft;

export type ProductsIndexCan = {
    create: boolean;
    update: boolean;
    delete: boolean;
};

export const IS_ACTIVE_FILTER_OPTIONS = isActiveFilterOptions('m');

export function formatIsActive(value: boolean): string {
    return formatIsActiveBase(value, 'm');
}

export const GLOBAL_VACCINES_PRODUCT_CATEGORY_NAME = 'Vacunas';

export function formatMasterLabel(option: MasterOption, selectedId?: string): string {
    const inactive = !option.is_active && option.id !== selectedId;
    const suffix = inactive ? ' (inactivo)' : '';

    return `${option.name}${suffix}`;
}
