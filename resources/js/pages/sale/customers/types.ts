import type { TabledataListStandardDraft } from '@/components/custom/tabledata';
import type { PaginatedListFilters } from '@/types/list-filters';

export type CustomerDocumentTypeValue = 'rut' | 'pasaporte';

export type Customer = {
    id: string;
    company_id: string;
    name: string;
    document_type: CustomerDocumentTypeValue;
    document_number: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    created_at: string;
    updated_at: string;
};

export const CUSTOMERS_INDEX_MODULE_FILTER_KEYS = ['document_type'] as const;

export type CustomersIndexModuleFilterKey =
    (typeof CUSTOMERS_INDEX_MODULE_FILTER_KEYS)[number];

export type CustomersIndexModuleFilters = {
    [K in CustomersIndexModuleFilterKey]: string;
};

export type CustomerListFilters = PaginatedListFilters & {
    [K in CustomersIndexModuleFilterKey]?: string | null;
};

export type CustomersIndexFiltersDraftFull =
    CustomersIndexModuleFilters & TabledataListStandardDraft;

export type CustomersIndexCan = {
    create: boolean;
    update: boolean;
    delete: boolean;
};

export const DOCUMENT_TYPE_OPTIONS = [
    { id: 'rut', label: 'RUT' },
    { id: 'pasaporte', label: 'Pasaporte' },
] as const;

export const DOCUMENT_TYPE_FILTER_OPTIONS = [
    { id: 'rut', label: 'RUT' },
    { id: 'pasaporte', label: 'Pasaporte' },
] as const;

export function formatDocumentType(value: CustomerDocumentTypeValue): string {
    if (value === 'rut') {
        return 'RUT';
    }

    return 'Pasaporte';
}
