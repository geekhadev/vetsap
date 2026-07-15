import { buildTabledataListInertiaForModuleStringKeys } from '@/components/custom/tabledata';
import type { TabledataListQueryValues } from '@/components/custom/tabledata';
import { buildModuleBreadcrumbs } from '@/lib/module-breadcrumbs';
import type {
    MovementTypeOption,
    ProductFilterOption,
    ProductMovement,
    ProductMovementListFilters,
    ProductMovementsIndexFiltersDraftFull,
} from '@/pages/store/product-movements/types';
import { PRODUCT_MOVEMENTS_INDEX_MODULE_FILTER_KEYS } from '@/pages/store/product-movements/types';
import { index as productMovementsIndex } from '@/routes/store/product-movements';
import type { BreadcrumbItem } from '@/types/navigation';
import type { Paginated } from '@/types/pagination';

export type ProductMovementsIndexPageProps = {
    data: Paginated<ProductMovement>;
    filters: ProductMovementsIndexFiltersDraftFull;
    movementTypes: MovementTypeOption[];
    products: ProductFilterOption[];
};

const PAGE = {
    storageKey: 'product-movements-index',
    title: 'Movimientos de productos',
    description: 'Historial de entradas y salidas por producto.',
    searchPlaceholder: 'Buscar por producto, código o número…',
} as const;

const ORDER = { sort: 'moved_at', direction: 'desc' } as const;

export const CONFIG_TABLEDATA = {
    storageKey: PAGE.storageKey,
    pageTitle: PAGE.title,
    pageDescription: PAGE.description,
    searchPlaceholder: PAGE.searchPlaceholder,
    order: ORDER,
    breadcrumbs: {
        index: (): BreadcrumbItem[] =>
            buildModuleBreadcrumbs(PAGE.title, productMovementsIndex()),
    },
    listInertia: buildTabledataListInertiaForModuleStringKeys<
        ProductMovement,
        ProductMovementListFilters,
        typeof PRODUCT_MOVEMENTS_INDEX_MODULE_FILTER_KEYS
    >({
        moduleKeys: PRODUCT_MOVEMENTS_INDEX_MODULE_FILTER_KEYS,
        indexUrl: (query: TabledataListQueryValues) =>
            productMovementsIndex.url({ query }),
        moduleResetQuery: { ...ORDER },
    }),
};
