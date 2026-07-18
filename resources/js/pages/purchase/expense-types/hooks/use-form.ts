import { useMemo } from 'react';
import ExpenseTypesController from '@/actions/App/Http/Controllers/Purchase/ExpenseTypesController';
import type { ExpenseType } from '../types';

export function useExpenseTypesForm(entity: ExpenseType | null) {
    const isEdit = entity !== null;
    const headTitle = isEdit ? 'Editar tipo de gasto' : 'Nuevo tipo de gasto';
    const description = isEdit
        ? 'Modifica el nombre y la abreviatura del tipo de gasto.'
        : 'Indica el nombre y la abreviatura del tipo de gasto.';

    const formProps = useMemo(() => {
        if (isEdit && entity) {
            return ExpenseTypesController.update.form({
                expense_type: entity.id,
            });
        }

        return ExpenseTypesController.store.form();
    }, [isEdit, entity]);

    return {
        isEdit,
        headTitle,
        description,
        formProps,
    };
}
