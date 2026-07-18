import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/purchase/expense-types';
import type { ExpenseType } from '../types';

export type { ExpenseTypesIndexPageProps } from '@/pages/purchase/expense-types/config';

export function useExpenseTypesIndex() {
    const { deleteRow, deleteConfirmDialog } =
        useTabledataDeleteRow<ExpenseType>({
            getDestroyUrl: (row) => destroy.url(row.id),
            confirmTitle: () => '¿Eliminar el tipo de gasto?',
            confirmDescription: (row) =>
                `Se eliminará el tipo de gasto «${row.name}». Esta acción no se puede deshacer.`,
        });

    return { deleteRow, deleteConfirmDialog };
}
