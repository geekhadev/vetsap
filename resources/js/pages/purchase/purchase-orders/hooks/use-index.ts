import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/purchase/purchase-orders';
import type { PurchaseOrder } from '../types';

export type { PurchaseOrdersIndexPageProps } from '@/pages/purchase/purchase-orders/config';

export function usePurchaseOrdersIndex() {
    const { deleteRow, deleteConfirmDialog } =
        useTabledataDeleteRow<PurchaseOrder>({
            getDestroyUrl: (row) => destroy.url(row.id),
            confirmTitle: () => '¿Eliminar la orden de compra?',
            confirmDescription: (row) =>
                `Se eliminará la orden de «${row.supplier?.name ?? 'proveedor'}» del ${row.ordered_at.slice(0, 10)}. Esta acción no se puede deshacer.`,
        });

    return { deleteRow, deleteConfirmDialog };
}
