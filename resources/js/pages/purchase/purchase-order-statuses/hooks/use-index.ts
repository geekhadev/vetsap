import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/purchase/purchase-order-statuses';
import type { PurchaseOrderStatus } from '../types';

export type { PurchaseOrderStatusesIndexPageProps } from '@/pages/purchase/purchase-order-statuses/config';

export function usePurchaseOrderStatusesIndex() {
    const { deleteRow, deleteConfirmDialog } =
        useTabledataDeleteRow<PurchaseOrderStatus>({
            getDestroyUrl: (row) => destroy.url(row.id),
            confirmTitle: () => '¿Eliminar el estado?',
            confirmDescription: (row) =>
                `Se eliminará el estado «${row.name}». Esta acción no se puede deshacer.`,
        });

    return { deleteRow, deleteConfirmDialog };
}
