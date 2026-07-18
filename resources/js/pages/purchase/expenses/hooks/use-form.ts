import { useMemo } from 'react';
import ExpensesController from '@/actions/App/Http/Controllers/Purchase/ExpensesController';
import type { Expense } from '../types';

export function useExpenseForm(entity: Expense | null) {
    const isEdit = entity !== null;
    const headTitle = isEdit ? 'Editar gasto' : 'Nuevo gasto';
    const description = isEdit
        ? 'Modifica la fecha, tipo, monto o motivo del gasto.'
        : 'Registra un gasto con su fecha, tipo, monto y motivo.';

    const formProps = useMemo(() => {
        if (isEdit && entity) {
            return ExpensesController.update.form({ expense: entity.id });
        }

        return ExpensesController.store.form();
    }, [isEdit, entity]);

    return {
        isEdit,
        headTitle,
        description,
        formProps,
    };
}
