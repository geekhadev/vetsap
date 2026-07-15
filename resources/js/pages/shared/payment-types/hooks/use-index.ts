/**
 * Hook mínimo del índice de tipos de pago: acciones fuera de `TabledataProvider` + Inertia list.
 */
import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/shared/payment-types';
import type { PaymentType } from '../types';

export type { PaymentTypesIndexPageProps } from '@/pages/shared/payment-types/config';

export function usePaymentTypesIndex() {
    const { deleteRow, deleteConfirmDialog } = useTabledataDeleteRow<PaymentType>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmTitle: () => '¿Eliminar el tipo de pago?',
        confirmDescription: (row) =>
            `Se eliminará el tipo de pago «${row.name}».Esta acción no se puede deshacer.`,
    });

    return { deleteRow, deleteConfirmDialog };
}
