import { buildTabledataListInertiaForModuleStringKeys } from '@/components/custom/tabledata';
import type { TabledataListQueryValues } from '@/components/custom/tabledata';
import { buildModuleBreadcrumbs } from '@/lib/module-breadcrumbs';
import type {
    Customer,
    CustomerListFilters,
    CustomersIndexCan,
    CustomersIndexFiltersDraftFull,
    SpeciesOption,
} from '@/pages/sale/customers/types';
import { CUSTOMERS_INDEX_MODULE_FILTER_KEYS } from '@/pages/sale/customers/types';
import { index as customersIndex } from '@/routes/sale/customers';
import type { BreadcrumbItem } from '@/types/navigation';
import type { Paginated } from '@/types/pagination';

export type CustomersIndexPageProps = {
    data: Paginated<Customer>;
    filters: CustomersIndexFiltersDraftFull;
    species: SpeciesOption[];
    can: CustomersIndexCan;
};

const PAGE = {
    storageKey: 'customers-index',
    title: 'Clientes',
    description: 'Cartera de clientes de la empresa activa.',
    searchPlaceholder: 'Nombre, documento o email…',
} as const;

const ORDER = { sort: 'name', direction: 'asc' } as const;

export const CONFIG_TABLEDATA = {
    storageKey: PAGE.storageKey,
    pageTitle: PAGE.title,
    pageDescription: PAGE.description,
    searchPlaceholder: PAGE.searchPlaceholder,
    order: ORDER,
    breadcrumbs: {
        index: (): BreadcrumbItem[] => buildModuleBreadcrumbs(PAGE.title, customersIndex()),
    },
    listInertia: buildTabledataListInertiaForModuleStringKeys<
        Customer,
        CustomerListFilters,
        typeof CUSTOMERS_INDEX_MODULE_FILTER_KEYS
    >({
        moduleKeys: CUSTOMERS_INDEX_MODULE_FILTER_KEYS,
        indexUrl: (query: TabledataListQueryValues) => customersIndex.url({ query }),
        moduleResetQuery: { ...ORDER },
    }),
};
