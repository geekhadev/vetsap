import { useMemo } from 'react';
import ProductsController from '@/actions/App/Http/Controllers/Store/ProductsController';
import type { Product } from '../types';

export function useProductForm(entity: Product | null) {
    const isEdit = entity !== null;
    const headTitle = isEdit ? 'Editar producto' : 'Nuevo producto';
    const description = isEdit
        ? 'Modifica los datos del producto.'
        : 'Completa categoría, tipo y nombre. Categoría y tipo pueden ser globales o de la empresa.';

    const formProps = useMemo(() => {
        if (isEdit && entity) {
            return ProductsController.update.form({ product: entity.id });
        }

        return ProductsController.store.form();
    }, [isEdit, entity]);

    return {
        isEdit,
        headTitle,
        description,
        formProps,
    };
}
