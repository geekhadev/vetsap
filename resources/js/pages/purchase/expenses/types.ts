import type { TabledataListStandardDraft } from '@/components/custom/tabledata';
import type { PaginatedListFilters } from '@/types/list-filters';

export type ExpenseTypeOption = {
    id: string;
    name: string;
    abbreviation: string;
};

export type ExpenseTypeRef = {
    id: string;
    name: string;
    abbreviation: string;
};

export type Expense = {
    id: string;
    company_id: string;
    spent_at: string;
    expense_type_id: string;
    amount: string;
    reason: string;
    expense_type?: ExpenseTypeRef;
    created_at: string;
    updated_at: string;
};

export type ExpensesIndexCan = {
    create: boolean;
    update: boolean;
    delete: boolean;
};

export const EXPENSES_INDEX_MODULE_FILTER_KEYS = ['expense_type_id'] as const;

export type ExpensesIndexModuleFilterKey =
    (typeof EXPENSES_INDEX_MODULE_FILTER_KEYS)[number];

export type ExpensesIndexModuleFilters = {
    [K in ExpensesIndexModuleFilterKey]: string;
};

export type ExpenseListFilters = PaginatedListFilters & {
    [K in ExpensesIndexModuleFilterKey]?: string | null;
};

export type ExpensesIndexFiltersDraftFull =
    ExpensesIndexModuleFilters & TabledataListStandardDraft;

export function formatExpenseTypeLabel(option: ExpenseTypeOption): string {
    return `${option.name} (${option.abbreviation})`;
}
