/**
 * Hook mínimo del índice de tipos de pago: acciones fuera de `TabledataProvider` + Inertia list.
 */
import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/shared/payment-types';
import type { PaymentType } from '../types';

export type { PaymentTypesIndexPageProps } from '@/pages/shared/payment-types/config';

export function usePaymentTypesIndex() {
    const { deleteRow } = useTabledataDeleteRow<PaymentType>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmMessage: (row) => `¿Eliminar el tipo de pago «${row.name}»?`,
    });

    return { deleteRow };
}
