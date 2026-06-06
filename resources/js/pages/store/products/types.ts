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

export type ProductTypeRef = {
    id: string;
    name: string;
    company_id: string | null;
};

export type Product = {
    id: string;
    company_id: string;
    product_category_id: string;
    product_type_id: string;
    name: string;
    barcode: string | null;
    description: string | null;
    price: string | null;
    is_active: boolean;
    product_category?: ProductCategoryRef;
    product_type?: ProductTypeRef;
    created_at: string;
    updated_at: string;
};

export const PRODUCTS_INDEX_MODULE_FILTER_KEYS = [
    'is_active',
    'product_category_id',
    'product_type_id',
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

export function formatPrice(price: string | null): string {
    if (price === null || price === '') {
        return '—';
    }

    const amount = Number(price);

    if (Number.isNaN(amount)) {
        return '—';
    }

    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatMasterLabel(option: MasterOption, selectedId?: string): string {
    const inactive = !option.is_active && option.id !== selectedId;
    const global = option.is_global ? ' (Global)' : '';
    const suffix = inactive ? ' (inactivo)' : '';

    return `${option.name}${global}${suffix}`;
}
