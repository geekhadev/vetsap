import { buildTabledataListInertiaForModuleStringKeys } from '@/components/custom/tabledata';
import type { TabledataListQueryValues } from '@/components/custom/tabledata';
import { buildModuleBreadcrumbs } from '@/lib/module-breadcrumbs';
import type {
    Product,
    ProductListFilters,
    ProductsIndexCan,
    ProductsIndexFiltersDraftFull,
    MasterOption,
} from '@/pages/store/products/types';
import { PRODUCTS_INDEX_MODULE_FILTER_KEYS } from '@/pages/store/products/types';
import { index as productsIndex } from '@/routes/store/products';
import type { BreadcrumbItem } from '@/types/navigation';
import type { Paginated } from '@/types/pagination';

export type ProductsIndexPageProps = {
    data: Paginated<Product>;
    filters: ProductsIndexFiltersDraftFull;
    productCategories: MasterOption[];
    can: ProductsIndexCan;
};

const PAGE = {
    storageKey: 'products-index',
    title: 'Productos',
    description: 'Catálogo de productos de la empresa activa.',
    searchPlaceholder: 'Buscar por nombre o código de barras…',
} as const;

const ORDER = { sort: 'name', direction: 'asc' } as const;

export const CONFIG_TABLEDATA = {
    storageKey: PAGE.storageKey,
    pageTitle: PAGE.title,
    pageDescription: PAGE.description,
    searchPlaceholder: PAGE.searchPlaceholder,
    order: ORDER,
    breadcrumbs: {
        index: (): BreadcrumbItem[] => buildModuleBreadcrumbs(PAGE.title, productsIndex()),
    },
    listInertia: buildTabledataListInertiaForModuleStringKeys<
        Product,
        ProductListFilters,
        typeof PRODUCTS_INDEX_MODULE_FILTER_KEYS
    >({
        moduleKeys: PRODUCTS_INDEX_MODULE_FILTER_KEYS,
        indexUrl: (query: TabledataListQueryValues) => productsIndex.url({ query }),
        moduleResetQuery: { ...ORDER },
    }),
};
