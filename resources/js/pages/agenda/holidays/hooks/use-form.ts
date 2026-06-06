import { useMemo } from 'react';
import HolidaysController from '@/actions/App/Http/Controllers/Agenda/HolidaysController';
import type { Holiday } from '../types';

export function useHolidaysForm(entity: Holiday | null) {
    const isEdit = entity !== null;
    const headTitle = isEdit ? 'Editar día feriado' : 'Nuevo día feriado';
    const description = isEdit
        ? 'Modifica los datos del día feriado.'
        : 'Indica el nombre, la fecha y el estado del feriado.';

    const formProps = useMemo(() => {
        if (isEdit && entity) {
            return HolidaysController.update.form({ holiday: entity.id });
        }

        return HolidaysController.store.form();
    }, [isEdit, entity]);

    return {
        isEdit,
        headTitle,
        description,
        formProps,
    };
}
