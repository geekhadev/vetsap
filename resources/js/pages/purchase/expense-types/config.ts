import { buildTabledataListInertiaForModuleStringKeys } from '@/components/custom/tabledata';
import type { TabledataListQueryValues } from '@/components/custom/tabledata';
import { buildModuleBreadcrumbs } from '@/lib/module-breadcrumbs';
import type {
    ExpenseType,
    ExpenseTypesIndexCan,
    ExpenseTypesIndexFiltersDraftFull,
    ExpenseTypesListFilters,
} from '@/pages/purchase/expense-types/types';
import { EXPENSE_TYPES_INDEX_MODULE_FILTER_KEYS } from '@/pages/purchase/expense-types/types';
import { index as expenseTypesIndex } from '@/routes/purchase/expense-types';
import type { BreadcrumbItem } from '@/types/navigation';
import type { Paginated } from '@/types/pagination';

export type ExpenseTypesIndexPageProps = {
    data: Paginated<ExpenseType>;
    filters: ExpenseTypesIndexFiltersDraftFull;
    can: ExpenseTypesIndexCan;
};

const PAGE = {
    storageKey: 'expense-types-index',
    title: 'Tipos de gastos',
    description: 'Catálogo de tipos de gasto de la empresa activa.',
    searchPlaceholder: 'Buscar por nombre o abreviatura…',
} as const;

const ORDER = { sort: 'name', direction: 'asc' } as const;

export const CONFIG_TABLEDATA = {
    storageKey: PAGE.storageKey,
    pageTitle: PAGE.title,
    pageDescription: PAGE.description,
    searchPlaceholder: PAGE.searchPlaceholder,
    order: ORDER,
    breadcrumbs: {
        index: (): BreadcrumbItem[] =>
            buildModuleBreadcrumbs(PAGE.title, expenseTypesIndex()),
    },
    listInertia: buildTabledataListInertiaForModuleStringKeys<
        ExpenseType,
        ExpenseTypesListFilters,
        typeof EXPENSE_TYPES_INDEX_MODULE_FILTER_KEYS
    >({
        moduleKeys: EXPENSE_TYPES_INDEX_MODULE_FILTER_KEYS,
        indexUrl: (query: TabledataListQueryValues) =>
            expenseTypesIndex.url({ query }),
        moduleResetQuery: { ...ORDER },
    }),
};
