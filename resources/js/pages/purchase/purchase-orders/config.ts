import { buildTabledataListInertiaForModuleStringKeys } from '@/components/custom/tabledata';
import type { TabledataListQueryValues } from '@/components/custom/tabledata';
import { buildModuleBreadcrumbs } from '@/lib/module-breadcrumbs';
import type {
    PurchaseOrder,
    PurchaseOrderListFilters,
    PurchaseOrderStatusOption,
    PurchaseOrdersIndexCan,
    PurchaseOrdersIndexFiltersDraftFull,
    SupplierOption,
} from '@/pages/purchase/purchase-orders/types';
import { PURCHASE_ORDERS_INDEX_MODULE_FILTER_KEYS } from '@/pages/purchase/purchase-orders/types';
import { index as purchaseOrdersIndex } from '@/routes/purchase/purchase-orders';
import type { BreadcrumbItem } from '@/types/navigation';
import type { Paginated } from '@/types/pagination';

export type PurchaseOrdersIndexPageProps = {
    data: Paginated<PurchaseOrder>;
    filters: PurchaseOrdersIndexFiltersDraftFull;
    suppliers: SupplierOption[];
    purchaseOrderStatuses: PurchaseOrderStatusOption[];
    can: PurchaseOrdersIndexCan;
};

const PAGE = {
    storageKey: 'purchase-orders-index',
    title: 'Órdenes de compra',
    description: 'Registro de órdenes de compra de la empresa activa.',
    searchPlaceholder: 'Proveedor o estado…',
} as const;

const ORDER = { sort: 'ordered_at', direction: 'desc' } as const;

export const CONFIG_TABLEDATA = {
    storageKey: PAGE.storageKey,
    pageTitle: PAGE.title,
    pageDescription: PAGE.description,
    searchPlaceholder: PAGE.searchPlaceholder,
    order: ORDER,
    breadcrumbs: {
        index: (): BreadcrumbItem[] =>
            buildModuleBreadcrumbs(PAGE.title, purchaseOrdersIndex()),
    },
    listInertia: buildTabledataListInertiaForModuleStringKeys<
        PurchaseOrder,
        PurchaseOrderListFilters,
        typeof PURCHASE_ORDERS_INDEX_MODULE_FILTER_KEYS
    >({
        moduleKeys: PURCHASE_ORDERS_INDEX_MODULE_FILTER_KEYS,
        indexUrl: (query: TabledataListQueryValues) =>
            purchaseOrdersIndex.url({ query }),
        moduleResetQuery: { ...ORDER },
    }),
};
