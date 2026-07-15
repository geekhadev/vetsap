import { useMemo } from 'react';
import type { MovementCategory } from '../types';
import MovementCategoriesController from '@/actions/App/Http/Controllers/Store/MovementCategoriesController';

export function useMovementCategoryForm(entity: MovementCategory | null) {
    const isEdit = entity !== null;
    const headTitle = isEdit
        ? 'Editar categoría de movimiento'
        : 'Nueva categoría de movimiento';
    const description = isEdit
        ? 'Modifica el nombre, tipo y estado de la categoría.'
        : 'Registra una categoría para entradas o salidas de inventario.';

    const formProps = useMemo(() => {
        if (isEdit && entity) {
            return MovementCategoriesController.update.form({
                movement_category: entity.id,
            });
        }

        return MovementCategoriesController.store.form();
    }, [isEdit, entity]);

    return {
        isEdit,
        headTitle,
        description,
        formProps,
    };
}
