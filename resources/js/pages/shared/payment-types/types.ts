import type { TabledataListStandardDraft } from '@/components/custom/tabledata';
import type { PaginatedListFilters } from '@/types/list-filters';

export type PaymentType = {
    id: string;
    name: string;
    code: string;
    created_at: string;
    updated_at: string;
};

/** Sin filtros de dominio en el índice; solo serialización / merge estándar de tabledata. */
export const PAYMENT_TYPES_INDEX_MODULE_FILTER_KEYS = [] as const;

export type PaymentTypeListFilters = PaginatedListFilters;

export type PaymentTypesIndexFiltersDraftFull = TabledataListStandardDraft;
