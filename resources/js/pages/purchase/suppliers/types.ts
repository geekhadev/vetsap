import type { TabledataListStandardDraft } from '@/components/custom/tabledata';
import type { PaginatedListFilters } from '@/types/list-filters';

export type SupplierDocumentTypeValue = 'rut' | 'pasaporte';

export type Supplier = {
    id: string;
    company_id: string;
    name: string;
    document_type: SupplierDocumentTypeValue;
    document_number: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    created_at: string;
    updated_at: string;
};

export type SuppliersIndexCan = {
    create: boolean;
    update: boolean;
    delete: boolean;
};

export const SUPPLIERS_INDEX_MODULE_FILTER_KEYS = ['document_type'] as const;

export type SuppliersIndexModuleFilterKey =
    (typeof SUPPLIERS_INDEX_MODULE_FILTER_KEYS)[number];

export type SuppliersIndexModuleFilters = {
    [K in SuppliersIndexModuleFilterKey]: string;
};

export type SupplierListFilters = PaginatedListFilters & {
    [K in SuppliersIndexModuleFilterKey]?: string | null;
};

export type SuppliersIndexFiltersDraftFull =
    SuppliersIndexModuleFilters & TabledataListStandardDraft;

export const DOCUMENT_TYPE_OPTIONS = [
    { id: 'rut', label: 'RUT' },
    { id: 'pasaporte', label: 'Pasaporte' },
] as const;

export const DOCUMENT_TYPE_FILTER_OPTIONS = [
    { id: 'rut', label: 'RUT' },
    { id: 'pasaporte', label: 'Pasaporte' },
] as const;

export function formatDocumentType(value: SupplierDocumentTypeValue): string {
    if (value === 'rut') {
        return 'RUT';
    }

    return 'Pasaporte';
}
