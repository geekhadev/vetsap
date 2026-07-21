import { buildTabledataListInertiaForModuleStringKeys } from '@/components/custom/tabledata';
import type { TabledataListQueryValues } from '@/components/custom/tabledata';
import { buildModuleBreadcrumbs } from '@/lib/module-breadcrumbs';
import type {
    CashRegister,
    CashRegisterListFilters,
    CashRegistersIndexCan,
    CashRegistersIndexFiltersDraftFull,
} from '@/pages/sale/cash-registers/types';
import { CASH_REGISTERS_INDEX_MODULE_FILTER_KEYS } from '@/pages/sale/cash-registers/types';
import { index as cashRegistersIndex } from '@/routes/sale/cash-registers';
import type { BreadcrumbItem } from '@/types/navigation';
import type { Paginated } from '@/types/pagination';

export type CashRegistersIndexPageProps = {
    data: Paginated<CashRegister>;
    filters: CashRegistersIndexFiltersDraftFull;
    can: CashRegistersIndexCan;
};

const PAGE = {
    storageKey: 'cash-registers-index',
    title: 'Registros de caja',
    description: 'Historial de aperturas y cierres de caja de la empresa activa.',
    searchPlaceholder: 'Sucursal o usuario…',
} as const;

const ORDER = { sort: 'opened_at', direction: 'desc' } as const;

export const CONFIG_TABLEDATA = {
    storageKey: PAGE.storageKey,
    pageTitle: PAGE.title,
    pageDescription: PAGE.description,
    searchPlaceholder: PAGE.searchPlaceholder,
    order: ORDER,
    breadcrumbs: {
        index: (): BreadcrumbItem[] =>
            buildModuleBreadcrumbs(PAGE.title, cashRegistersIndex()),
    },
    listInertia: buildTabledataListInertiaForModuleStringKeys<
        CashRegister,
        CashRegisterListFilters,
        typeof CASH_REGISTERS_INDEX_MODULE_FILTER_KEYS
    >({
        moduleKeys: CASH_REGISTERS_INDEX_MODULE_FILTER_KEYS,
        indexUrl: (query: TabledataListQueryValues) =>
            cashRegistersIndex.url({ query }),
        moduleResetQuery: { ...ORDER },
    }),
};
