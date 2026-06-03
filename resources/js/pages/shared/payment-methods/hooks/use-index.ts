/**
 * Hook mínimo del índice de métodos de pago: acciones fuera de `TabledataProvider` + Inertia list.
 */
import { router } from '@inertiajs/react';
import { useCallback } from 'react';
import { TABLEDATA_LIST_INERTIA_ONLY } from '@/components/custom/tabledata';
import { destroy } from '@/routes/shared/payment-methods';
import type { PaymentMethod } from '../types';

export type { PaymentMethodsIndexPageProps } from '@/pages/shared/payment-methods/config';

export function usePaymentMethodsIndex() {
    const deleteRow = useCallback((row: PaymentMethod) => {
        if (!window.confirm(`¿Eliminar el método de pago «${row.name}»?`)) {
            return;
        }

        router.delete(destroy.url(row.id), {
            preserveScroll: true,
            only: [...TABLEDATA_LIST_INERTIA_ONLY],
        });
    }, []);

    return {
        deleteRow,
    };
}
