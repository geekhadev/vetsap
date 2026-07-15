import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/sale/customers';
import type { Customer } from '../types';

export type { CustomersIndexPageProps } from '@/pages/sale/customers/config';

export function useCustomersIndex() {
    const { deleteRow, deleteConfirmDialog } = useTabledataDeleteRow<Customer>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmTitle: () => '¿Eliminar el cliente?',
        confirmDescription: (row) =>
            `Se eliminará el cliente «${row.name}».Esta acción no se puede deshacer.`,
    });

    return { deleteRow, deleteConfirmDialog };
}
