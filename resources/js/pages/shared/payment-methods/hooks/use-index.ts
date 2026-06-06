/**
 * Hook mínimo del índice de métodos de pago: acciones fuera de `TabledataProvider` + Inertia list.
 */
import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/shared/payment-methods';
import type { PaymentMethod } from '../types';

export type { PaymentMethodsIndexPageProps } from '@/pages/shared/payment-methods/config';

export function usePaymentMethodsIndex() {
    const { deleteRow } = useTabledataDeleteRow<PaymentMethod>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmMessage: (row) => `¿Eliminar el método de pago «${row.name}»?`,
    });

    return { deleteRow };
}
