import { useMemo } from 'react';
import ProductTypesController from '@/actions/App/Http/Controllers/Store/ProductTypesController';
import type { ProductType } from '../types';

export function useProductTypeForm(entity: ProductType | null) {
    const isEdit = entity !== null;
    const headTitle = isEdit ? 'Editar tipo de producto' : 'Nuevo tipo de producto';
    const description = isEdit
        ? 'Modifica el nombre y el estado del tipo. Si tiene productos activos, no podrás desactivarlo.'
        : 'Registra un tipo de producto para la empresa activa.';

    const formProps = useMemo(() => {
        if (isEdit && entity) {
            return ProductTypesController.update.form({ product_type: entity.id });
        }

        return ProductTypesController.store.form();
    }, [isEdit, entity]);

    return {
        isEdit,
        headTitle,
        description,
        formProps,
    };
}
