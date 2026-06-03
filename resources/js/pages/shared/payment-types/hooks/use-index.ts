/**
 * Hook mínimo del índice de tipos de pago: acciones fuera de `TabledataProvider` + Inertia list.
 */
import { router } from '@inertiajs/react';
import { useCallback } from 'react';
import { TABLEDATA_LIST_INERTIA_ONLY } from '@/components/custom/tabledata';
import { destroy } from '@/routes/shared/payment-types';
import type { PaymentType } from '../types';

export type { PaymentTypesIndexPageProps } from '@/pages/shared/payment-types/config';

export function usePaymentTypesIndex() {
    const deleteRow = useCallback((row: PaymentType) => {
        if (!window.confirm(`¿Eliminar el tipo de pago «${row.name}»?`)) {
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
