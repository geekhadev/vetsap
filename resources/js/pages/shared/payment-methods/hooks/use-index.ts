/**
 * Hook mínimo del índice de métodos de pago: acciones fuera de `TabledataProvider` + Inertia list.
 */
import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/shared/payment-methods';
import type { PaymentMethod } from '../types';

export type { PaymentMethodsIndexPageProps } from '@/pages/shared/payment-methods/config';

export function usePaymentMethodsIndex() {
    const { deleteRow, deleteConfirmDialog } = useTabledataDeleteRow<PaymentMethod>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmTitle: () => '¿Eliminar el método de pago?',
        confirmDescription: (row) =>
            `Se eliminará el método de pago «${row.name}».Esta acción no se puede deshacer.`,
    });

    return { deleteRow, deleteConfirmDialog };
}
