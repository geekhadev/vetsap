import { useMemo } from 'react';
import ServicesController from '@/actions/App/Http/Controllers/Medic/ServicesController';
import type { Service } from '../types';

export function useServiceForm(entity: Service | null) {
    const isEdit = entity !== null;
    const headTitle = isEdit ? 'Editar servicio' : 'Nuevo servicio';
    const description = isEdit
        ? 'Modifica los datos del servicio. Si tiene citas asociadas, no podrás eliminarlo; desactívalo en su lugar.'
        : 'Define la especialidad, nombre, precio y duración del servicio.';

    const formProps = useMemo(() => {
        if (isEdit && entity) {
            return ServicesController.update.form({ service: entity.id });
        }

        return ServicesController.store.form();
    }, [isEdit, entity]);

    return {
        isEdit,
        headTitle,
        description,
        formProps,
    };
}
