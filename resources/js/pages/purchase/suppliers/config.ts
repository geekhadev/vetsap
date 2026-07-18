import { buildTabledataListInertiaForModuleStringKeys } from '@/components/custom/tabledata';
import type { TabledataListQueryValues } from '@/components/custom/tabledata';
import { buildModuleBreadcrumbs } from '@/lib/module-breadcrumbs';
import type {
    Supplier,
    SupplierListFilters,
    SuppliersIndexCan,
    SuppliersIndexFiltersDraftFull,
} from '@/pages/purchase/suppliers/types';
import { SUPPLIERS_INDEX_MODULE_FILTER_KEYS } from '@/pages/purchase/suppliers/types';
import { index as suppliersIndex } from '@/routes/purchase/suppliers';
import type { BreadcrumbItem } from '@/types/navigation';
import type { Paginated } from '@/types/pagination';

export type SuppliersIndexPageProps = {
    data: Paginated<Supplier>;
    filters: SuppliersIndexFiltersDraftFull;
    can: SuppliersIndexCan;
};

const PAGE = {
    storageKey: 'suppliers-index',
    title: 'Proveedores',
    description: 'Cartera de proveedores de la empresa activa.',
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
        index: (): BreadcrumbItem[] => buildModuleBreadcrumbs(PAGE.title, suppliersIndex()),
    },
    listInertia: buildTabledataListInertiaForModuleStringKeys<
        Supplier,
        SupplierListFilters,
        typeof SUPPLIERS_INDEX_MODULE_FILTER_KEYS
    >({
        moduleKeys: SUPPLIERS_INDEX_MODULE_FILTER_KEYS,
        indexUrl: (query: TabledataListQueryValues) => suppliersIndex.url({ query }),
        moduleResetQuery: { ...ORDER },
    }),
};
