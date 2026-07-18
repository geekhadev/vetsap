import { buildTabledataListInertiaForModuleStringKeys } from '@/components/custom/tabledata';
import type { TabledataListQueryValues } from '@/components/custom/tabledata';
import { buildModuleBreadcrumbs } from '@/lib/module-breadcrumbs';
import type {
    Expense,
    ExpenseListFilters,
    ExpensesIndexCan,
    ExpensesIndexFiltersDraftFull,
    ExpenseTypeOption,
} from '@/pages/purchase/expenses/types';
import { EXPENSES_INDEX_MODULE_FILTER_KEYS } from '@/pages/purchase/expenses/types';
import { index as expensesIndex } from '@/routes/purchase/expenses';
import type { BreadcrumbItem } from '@/types/navigation';
import type { Paginated } from '@/types/pagination';

export type ExpensesIndexPageProps = {
    data: Paginated<Expense>;
    filters: ExpensesIndexFiltersDraftFull;
    expenseTypes: ExpenseTypeOption[];
    can: ExpensesIndexCan;
};

const PAGE = {
    storageKey: 'expenses-index',
    title: 'Gastos',
    description: 'Registro de gastos de la empresa activa.',
    searchPlaceholder: 'Motivo o tipo de gasto…',
} as const;

const ORDER = { sort: 'spent_at', direction: 'desc' } as const;

export const CONFIG_TABLEDATA = {
    storageKey: PAGE.storageKey,
    pageTitle: PAGE.title,
    pageDescription: PAGE.description,
    searchPlaceholder: PAGE.searchPlaceholder,
    order: ORDER,
    breadcrumbs: {
        index: (): BreadcrumbItem[] => buildModuleBreadcrumbs(PAGE.title, expensesIndex()),
    },
    listInertia: buildTabledataListInertiaForModuleStringKeys<
        Expense,
        ExpenseListFilters,
        typeof EXPENSES_INDEX_MODULE_FILTER_KEYS
    >({
        moduleKeys: EXPENSES_INDEX_MODULE_FILTER_KEYS,
        indexUrl: (query: TabledataListQueryValues) => expensesIndex.url({ query }),
        moduleResetQuery: { ...ORDER },
    }),
};
