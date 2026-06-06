import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/store/product-categories';
import type { ProductCategory } from '../types';

export type { ProductCategoriesIndexPageProps } from '@/pages/store/product-categories/config';

export function useProductCategoriesIndex() {
    const { deleteRow } = useTabledataDeleteRow<ProductCategory>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmMessage: (row) =>
            `¿Eliminar la categoría «${row.name}»? Esta acción no se puede deshacer.`,
    });

    return { deleteRow };
}
