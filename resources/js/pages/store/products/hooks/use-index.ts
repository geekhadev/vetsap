import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/store/products';
import type { Product } from '../types';

export type { ProductsIndexPageProps } from '@/pages/store/products/config';

export function useProductsIndex() {
    const { deleteRow, deleteConfirmDialog } = useTabledataDeleteRow<Product>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmTitle: () => '¿Eliminar el producto?',
        confirmDescription: (row) =>
            `Se eliminará el producto «${row.name}». Esta acción no se puede deshacer.`,
    });

    return { deleteRow, deleteConfirmDialog };
}
