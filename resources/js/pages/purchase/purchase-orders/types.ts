import { formatCurrencyDisplay } from '@/components/custom/currency-display';
import type { TabledataListStandardDraft } from '@/components/custom/tabledata';
import type { AppointmentStatusColorValue } from '@/lib/appointment-status-colors';
import type { PaginatedListFilters } from '@/types/list-filters';

export type SupplierOption = {
    id: string;
    name: string;
    document_number: string;
};

export type PurchaseOrderStatusOption = {
    id: string;
    name: string;
    color: AppointmentStatusColorValue | string;
};

export type SupplierRef = {
    id: string;
    name: string;
    document_number: string;
};

export type PurchaseOrderStatusRef = {
    id: string;
    name: string;
    color: AppointmentStatusColorValue | string;
};

export type ProductRef = {
    id: string;
    name: string;
    barcode: string | null;
};

export type PurchaseOrderDetail = {
    id: string;
    purchase_order_id: string;
    product_id: string;
    quantity: number;
    unit_price: string;
    total: string;
    product?: ProductRef;
};

export type PurchaseOrderUserRef = {
    id: string;
    name: string;
};

export type PurchaseOrder = {
    id: string;
    company_id: string;
    ordered_at: string;
    supplier_id: string;
    purchase_order_status_id: string;
    user_id: string | null;
    total: string;
    supplier?: SupplierRef;
    purchase_order_status?: PurchaseOrderStatusRef;
    user?: PurchaseOrderUserRef | null;
    details?: PurchaseOrderDetail[];
    created_at: string;
    updated_at: string;
};

export type PurchaseOrderDetailLine = {
    key: string;
    product_id: string;
    product_name: string;
    product_barcode: string | null;
    quantity: string;
    unit_price: string;
};

export type PurchaseOrdersIndexCan = {
    create: boolean;
    update: boolean;
    delete: boolean;
};

export const PURCHASE_ORDERS_INDEX_MODULE_FILTER_KEYS = [
    'supplier_id',
    'purchase_order_status_id',
] as const;

export type PurchaseOrdersIndexModuleFilterKey =
    (typeof PURCHASE_ORDERS_INDEX_MODULE_FILTER_KEYS)[number];

export type PurchaseOrdersIndexModuleFilters = {
    [K in PurchaseOrdersIndexModuleFilterKey]: string;
};

export type PurchaseOrderListFilters = PaginatedListFilters & {
    [K in PurchaseOrdersIndexModuleFilterKey]?: string | null;
};

export type PurchaseOrdersIndexFiltersDraftFull =
    PurchaseOrdersIndexModuleFilters & TabledataListStandardDraft;

export function formatSupplierLabel(option: SupplierOption): string {
    return `${option.name} (${option.document_number})`;
}

export function lineTotal(quantity: string, unitPrice: string): number {
    const qty = Number(quantity);
    const price = Number(unitPrice);

    if (!Number.isFinite(qty) || !Number.isFinite(price) || qty < 0 || price < 0) {
        return 0;
    }

    return Math.round(qty) * Math.round(price);
}

export function formatLineTotal(quantity: string, unitPrice: string): string {
    return formatCurrencyDisplay(lineTotal(quantity, unitPrice));
}

export function orderTotalFromLines(lines: PurchaseOrderDetailLine[]): number {
    return lines.reduce(
        (sum, line) => sum + lineTotal(line.quantity, line.unit_price),
        0,
    );
}
