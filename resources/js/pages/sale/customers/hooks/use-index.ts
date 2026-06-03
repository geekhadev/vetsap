import { router } from '@inertiajs/react';
import { useCallback } from 'react';
import { TABLEDATA_LIST_INERTIA_ONLY } from '@/components/custom/tabledata';
import { destroy } from '@/routes/sale/customers';
import type { Customer } from '../types';

export type { CustomersIndexPageProps } from '@/pages/sale/customers/config';

export function useCustomersIndex() {
    const deleteRow = useCallback((row: Customer) => {
        if (!window.confirm(`¿Eliminar el cliente «${row.name}»?`)) {
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
