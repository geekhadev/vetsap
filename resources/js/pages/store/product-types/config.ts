import { buildTabledataListInertiaForModuleStringKeys } from '@/components/custom/tabledata';
import type { TabledataListQueryValues } from '@/components/custom/tabledata';
import type {
    ProductType,
    ProductTypeListFilters,
    ProductTypesIndexCan,
    ProductTypesIndexFiltersDraftFull,
} from '@/pages/store/product-types/types';
import { PRODUCT_TYPES_INDEX_MODULE_FILTER_KEYS } from '@/pages/store/product-types/types';
import { dashboard } from '@/routes';
import { index as productTypesIndex } from '@/routes/store/product-types';
import type { BreadcrumbItem } from '@/types/navigation';
import type { Paginated } from '@/types/pagination';

export type ProductTypesIndexPageProps = {
    data: Paginated<ProductType>;
    filters: ProductTypesIndexFiltersDraftFull;
    can: ProductTypesIndexCan;
};

const PAGE = {
    storageKey: 'product-types-index',
    title: 'Tipos de productos',
    description: 'Tipos globales y de la empresa activa.',
    searchPlaceholder: 'Buscar por nombre…',
} as const;

const ORDER = { sort: 'name', direction: 'asc' } as const;

export const CONFIG_TABLEDATA = {
    storageKey: PAGE.storageKey,
    pageTitle: PAGE.title,
    pageDescription: PAGE.description,
    searchPlaceholder: PAGE.searchPlaceholder,
    order: ORDER,
    breadcrumbs: {
        index: (): BreadcrumbItem[] => [
            { title: 'Panel', href: dashboard() },
            { title: PAGE.title, href: productTypesIndex() },
        ],
    },
    listInertia: buildTabledataListInertiaForModuleStringKeys<
        ProductType,
        ProductTypeListFilters,
        typeof PRODUCT_TYPES_INDEX_MODULE_FILTER_KEYS
    >({
        moduleKeys: PRODUCT_TYPES_INDEX_MODULE_FILTER_KEYS,
        indexUrl: (query: TabledataListQueryValues) => productTypesIndex.url({ query }),
        moduleResetQuery: { ...ORDER },
    }),
};
