import { buildTabledataListInertiaForModuleStringKeys } from '@/components/custom/tabledata';
import type { TabledataListQueryValues } from '@/components/custom/tabledata';
import { buildModuleBreadcrumbs } from '@/lib/module-breadcrumbs';
import type {
    PurchaseOrderStatus,
    PurchaseOrderStatusesIndexCan,
    PurchaseOrderStatusesIndexFiltersDraftFull,
    PurchaseOrderStatusesListFilters,
} from '@/pages/purchase/purchase-order-statuses/types';
import { PURCHASE_ORDER_STATUSES_INDEX_MODULE_FILTER_KEYS } from '@/pages/purchase/purchase-order-statuses/types';
import { index as purchaseOrderStatusesIndex } from '@/routes/purchase/purchase-order-statuses';
import type { BreadcrumbItem } from '@/types/navigation';
import type { Paginated } from '@/types/pagination';

export type PurchaseOrderStatusesIndexPageProps = {
    data: Paginated<PurchaseOrderStatus>;
    filters: PurchaseOrderStatusesIndexFiltersDraftFull;
    can: PurchaseOrderStatusesIndexCan;
};

const PAGE = {
    storageKey: 'purchase-order-statuses-index',
    title: 'Estados de orden de compra',
    description: 'Catálogo de estados para clasificar las órdenes de compra.',
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
            buildModuleBreadcrumbs(PAGE.title, purchaseOrderStatusesIndex()),
    },
    listInertia: buildTabledataListInertiaForModuleStringKeys<
        PurchaseOrderStatus,
        PurchaseOrderStatusesListFilters,
        typeof PURCHASE_ORDER_STATUSES_INDEX_MODULE_FILTER_KEYS
    >({
        moduleKeys: PURCHASE_ORDER_STATUSES_INDEX_MODULE_FILTER_KEYS,
        indexUrl: (query: TabledataListQueryValues) =>
            purchaseOrderStatusesIndex.url({ query }),
        moduleResetQuery: { ...ORDER },
    }),
};
