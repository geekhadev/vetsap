import { useMemo } from 'react';
import ProductCategoriesController from '@/actions/App/Http/Controllers/Store/ProductCategoriesController';
import type { ProductCategory } from '../types';

export function useProductCategoryForm(entity: ProductCategory | null) {
    const isEdit = entity !== null;
    const headTitle = isEdit ? 'Editar categoría de producto' : 'Nueva categoría de producto';
    const description = isEdit
        ? 'Modifica el nombre y el estado de la categoría.'
        : 'Registra una categoría de producto para la empresa activa.';

    const formProps = useMemo(() => {
        if (isEdit && entity) {
            return ProductCategoriesController.update.form({ product_category: entity.id });
        }

        return ProductCategoriesController.store.form();
    }, [isEdit, entity]);

    return {
        isEdit,
        headTitle,
        description,
        formProps,
    };
}
