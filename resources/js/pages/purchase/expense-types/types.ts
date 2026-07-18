import type { TabledataListStandardDraft } from '@/components/custom/tabledata';
import type { PaginatedListFilters } from '@/types/list-filters';

export type ExpenseType = {
    id: string;
    company_id: string | null;
    name: string;
    abbreviation: string;
    is_global: boolean;
    created_at: string;
    updated_at: string;
};

/** Sin filtros de dominio en el índice; solo serialización / merge estándar de tabledata. */
export const EXPENSE_TYPES_INDEX_MODULE_FILTER_KEYS = [] as const;

export type ExpenseTypesListFilters = PaginatedListFilters;

export type ExpenseTypesIndexFiltersDraftFull = TabledataListStandardDraft;

export type ExpenseTypesIndexCan = {
    create: boolean;
    update: boolean;
    delete: boolean;
};
