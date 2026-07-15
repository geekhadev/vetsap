import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/store/product-types';
import type { ProductType } from '../types';

export type { ProductTypesIndexPageProps } from '@/pages/store/product-types/config';

export function useProductTypesIndex() {
    const { deleteRow, deleteConfirmDialog } = useTabledataDeleteRow<ProductType>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmTitle: () => '¿Eliminar el tipo?',
        confirmDescription: (row) =>
            `Se eliminará el tipo «${row.name}». Esta acción no se puede deshacer.`,
    });

    return { deleteRow, deleteConfirmDialog };
}
