import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/sale/customers';
import type { Customer } from '../types';

export type { CustomersIndexPageProps } from '@/pages/sale/customers/config';

export function useCustomersIndex() {
    const { deleteRow } = useTabledataDeleteRow<Customer>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmMessage: (row) => `¿Eliminar el cliente «${row.name}»?`,
    });

    return { deleteRow };
}
