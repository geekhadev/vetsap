import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/store/movement-categories';
import type { MovementCategory } from '../types';

export type { MovementCategoriesIndexPageProps } from '@/pages/store/movement-categories/config';

export function useMovementCategoriesIndex() {
    const { deleteRow, deleteConfirmDialog } = useTabledataDeleteRow<MovementCategory>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmTitle: () => '¿Eliminar la categoría?',
        confirmDescription: (row) =>
            `Se eliminará la categoría «${row.name}». Esta acción no se puede deshacer.`,
    });

    return { deleteRow, deleteConfirmDialog };
}
