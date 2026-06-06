import { buildTabledataListInertiaForModuleStringKeys } from '@/components/custom/tabledata';
import type { TabledataListQueryValues } from '@/components/custom/tabledata';
import type {
    ProductCategory,
    ProductCategoryListFilters,
    ProductCategoriesIndexCan,
    ProductCategoriesIndexFiltersDraftFull,
} from '@/pages/store/product-categories/types';
import { PRODUCT_CATEGORIES_INDEX_MODULE_FILTER_KEYS } from '@/pages/store/product-categories/types';
import { dashboard } from '@/routes';
import { index as productCategoriesIndex } from '@/routes/store/product-categories';
import type { BreadcrumbItem } from '@/types/navigation';
import type { Paginated } from '@/types/pagination';

export type ProductCategoriesIndexPageProps = {
    data: Paginated<ProductCategory>;
    filters: ProductCategoriesIndexFiltersDraftFull;
    can: ProductCategoriesIndexCan;
};

const PAGE = {
    storageKey: 'product-categories-index',
    title: 'Categorías de productos',
    description: 'Categorías globales y de la empresa activa.',
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
            { title: PAGE.title, href: productCategoriesIndex() },
        ],
    },
    listInertia: buildTabledataListInertiaForModuleStringKeys<
        ProductCategory,
        ProductCategoryListFilters,
        typeof PRODUCT_CATEGORIES_INDEX_MODULE_FILTER_KEYS
    >({
        moduleKeys: PRODUCT_CATEGORIES_INDEX_MODULE_FILTER_KEYS,
        indexUrl: (query: TabledataListQueryValues) =>
            productCategoriesIndex.url({ query }),
        moduleResetQuery: { ...ORDER },
    }),
};
