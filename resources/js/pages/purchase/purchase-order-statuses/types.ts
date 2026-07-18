import type { TabledataListStandardDraft } from '@/components/custom/tabledata';
import type { AppointmentStatusColorValue } from '@/lib/appointment-status-colors';
import type { PaginatedListFilters } from '@/types/list-filters';

export type PurchaseOrderStatus = {
    id: string;
    company_id: string | null;
    name: string;
    color: AppointmentStatusColorValue;
    is_global: boolean;
    created_at: string;
    updated_at: string;
};

/** Sin filtros de dominio en el índice; solo serialización / merge estándar de tabledata. */
export const PURCHASE_ORDER_STATUSES_INDEX_MODULE_FILTER_KEYS = [] as const;

export type PurchaseOrderStatusesListFilters = PaginatedListFilters;

export type PurchaseOrderStatusesIndexFiltersDraftFull = TabledataListStandardDraft;

export type PurchaseOrderStatusesIndexCan = {
    create: boolean;
    update: boolean;
    delete: boolean;
};
