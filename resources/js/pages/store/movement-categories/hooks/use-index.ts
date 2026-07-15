import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/store/movement-categories';
import type { MovementCategory } from '../types';

export type { MovementCategoriesIndexPageProps } from '@/pages/store/movement-categories/config';

export function useMovementCategoriesIndex() {
    const { deleteRow } = useTabledataDeleteRow<MovementCategory>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmMessage: (row) =>
            `¿Eliminar la categoría «${row.name}»? Esta acción no se puede deshacer.`,
    });

    return { deleteRow };
}
