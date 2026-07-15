import { buildTabledataListInertiaForModuleStringKeys } from '@/components/custom/tabledata';
import type { TabledataListQueryValues } from '@/components/custom/tabledata';
import { buildModuleBreadcrumbs } from '@/lib/module-breadcrumbs';
import type {
    InventoryMovement,
    InventoryMovementListFilters,
    InventoryMovementsIndexCan,
    InventoryMovementsIndexFiltersDraftFull,
    MovementCategoryOption,
    MovementTypeOption,
    ProductOption,
} from '@/pages/store/inventory-movements/types';
import { INVENTORY_MOVEMENTS_INDEX_MODULE_FILTER_KEYS } from '@/pages/store/inventory-movements/types';
import { index as inventoryMovementsIndex } from '@/routes/store/inventory-movements';
import type { BreadcrumbItem } from '@/types/navigation';
import type { Paginated } from '@/types/pagination';

export type InventoryMovementsIndexPageProps = {
    data: Paginated<InventoryMovement>;
    filters: InventoryMovementsIndexFiltersDraftFull;
    movementTypes: MovementTypeOption[];
    movementCategories: MovementCategoryOption[];
    products: ProductOption[];
    can: InventoryMovementsIndexCan;
};

const PAGE = {
    storageKey: 'inventory-movements-index',
    title: 'Movimientos de inventario',
    description: 'Entradas y salidas de stock de productos.',
    searchPlaceholder: 'Buscar por número…',
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
            buildModuleBreadcrumbs(PAGE.title, inventoryMovementsIndex()),
    },
    listInertia: buildTabledataListInertiaForModuleStringKeys<
        InventoryMovement,
        InventoryMovementListFilters,
        typeof INVENTORY_MOVEMENTS_INDEX_MODULE_FILTER_KEYS
    >({
        moduleKeys: INVENTORY_MOVEMENTS_INDEX_MODULE_FILTER_KEYS,
        indexUrl: (query: TabledataListQueryValues) =>
            inventoryMovementsIndex.url({ query }),
        moduleResetQuery: { ...ORDER },
    }),
};
