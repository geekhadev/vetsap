import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/purchase/expenses';
import type { Expense } from '../types';

export type { ExpensesIndexPageProps } from '@/pages/purchase/expenses/config';

export function useExpensesIndex() {
    const { deleteRow, deleteConfirmDialog } = useTabledataDeleteRow<Expense>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmTitle: () => '¿Eliminar el gasto?',
        confirmDescription: (row) =>
            `Se eliminará el gasto «${row.reason}». Esta acción no se puede deshacer.`,
    });

    return { deleteRow, deleteConfirmDialog };
}
