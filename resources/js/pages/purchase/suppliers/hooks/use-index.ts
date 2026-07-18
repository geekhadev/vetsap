import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/purchase/suppliers';
import type { Supplier } from '../types';

export type { SuppliersIndexPageProps } from '@/pages/purchase/suppliers/config';

export function useSuppliersIndex() {
    const { deleteRow, deleteConfirmDialog } = useTabledataDeleteRow<Supplier>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmTitle: () => '¿Eliminar el proveedor?',
        confirmDescription: (row) =>
            `Se eliminará el proveedor «${row.name}». Esta acción no se puede deshacer.`,
    });

    return { deleteRow, deleteConfirmDialog };
}
