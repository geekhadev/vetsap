import { useMemo } from 'react';
import PurchaseOrdersController from '@/actions/App/Http/Controllers/Purchase/PurchaseOrdersController';
import type { PurchaseOrder } from '../types';

export function usePurchaseOrderForm(entity: PurchaseOrder | null) {
    const isEdit = entity !== null;
    const headTitle = isEdit ? 'Editar orden de compra' : 'Nueva orden de compra';
    const description = isEdit
        ? 'Modifica la fecha, proveedor, estado o el detalle de productos.'
        : 'Registra una orden con proveedor, estado y al menos una línea de detalle.';

    const formProps = useMemo(() => {
        if (isEdit && entity) {
            return PurchaseOrdersController.update.form({
                purchase_order: entity.id,
            });
        }

        return PurchaseOrdersController.store.form();
    }, [isEdit, entity]);

    return {
        isEdit,
        headTitle,
        description,
        formProps,
    };
}
