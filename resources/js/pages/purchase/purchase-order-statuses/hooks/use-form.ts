import { useMemo } from 'react';
import PurchaseOrderStatusesController from '@/actions/App/Http/Controllers/Purchase/PurchaseOrderStatusesController';
import type { PurchaseOrderStatus } from '../types';

export function usePurchaseOrderStatusesForm(entity: PurchaseOrderStatus | null) {
    const isEdit = entity !== null;
    const headTitle = isEdit
        ? 'Editar estado de orden de compra'
        : 'Nuevo estado de orden de compra';
    const description = isEdit
        ? 'Modifica el nombre y el color del registro.'
        : 'Indica el nombre y el color con el que se mostrará en órdenes de compra.';

    const formProps = useMemo(() => {
        if (isEdit && entity) {
            return PurchaseOrderStatusesController.update.form({
                purchase_order_status: entity.id,
            });
        }

        return PurchaseOrderStatusesController.store.form();
    }, [isEdit, entity]);

    return {
        isEdit,
        headTitle,
        description,
        formProps,
    };
}
