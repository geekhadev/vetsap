import { buildTabledataListInertiaForModuleStringKeys } from '@/components/custom/tabledata';
import type { TabledataListQueryValues } from '@/components/custom/tabledata';
import { buildModuleBreadcrumbs } from '@/lib/module-breadcrumbs';
import type {
    MovementCategory,
    MovementCategoryListFilters,
    MovementCategoriesIndexCan,
    MovementCategoriesIndexFiltersDraftFull,
    MovementTypeOption,
} from '@/pages/store/movement-categories/types';
import { MOVEMENT_CATEGORIES_INDEX_MODULE_FILTER_KEYS } from '@/pages/store/movement-categories/types';
import { index as movementCategoriesIndex } from '@/routes/store/movement-categories';
import type { BreadcrumbItem } from '@/types/navigation';
import type { Paginated } from '@/types/pagination';

export type MovementCategoriesIndexPageProps = {
    data: Paginated<MovementCategory>;
    filters: MovementCategoriesIndexFiltersDraftFull;
    movementTypes: MovementTypeOption[];
    can: MovementCategoriesIndexCan;
};

const PAGE = {
    storageKey: 'movement-categories-index',
    title: 'Categorías de movimiento',
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
        index: (): BreadcrumbItem[] =>
            buildModuleBreadcrumbs(PAGE.title, movementCategoriesIndex()),
    },
    listInertia: buildTabledataListInertiaForModuleStringKeys<
        MovementCategory,
        MovementCategoryListFilters,
        typeof MOVEMENT_CATEGORIES_INDEX_MODULE_FILTER_KEYS
    >({
        moduleKeys: MOVEMENT_CATEGORIES_INDEX_MODULE_FILTER_KEYS,
        indexUrl: (query: TabledataListQueryValues) =>
            movementCategoriesIndex.url({ query }),
        moduleResetQuery: { ...ORDER },
    }),
};
