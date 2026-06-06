import { useMemo } from 'react';
import DoctorsController from '@/actions/App/Http/Controllers/Medic/DoctorsController';
import type { Doctor } from '../types';

export function useDoctorForm(entity: Doctor | null) {
    const isEdit = entity !== null;
    const headTitle = isEdit ? 'Editar doctor' : 'Nuevo doctor';
    const description = isEdit
        ? 'Modifica los datos de contacto y el estado del profesional. El tipo y número de documento no se pueden cambiar.'
        : 'Registra un veterinario o profesional. Podrás asignar servicios desde el listado.';

    const formProps = useMemo(() => {
        if (isEdit && entity) {
            return DoctorsController.update.form({ doctor: entity.id });
        }

        return DoctorsController.store.form();
    }, [isEdit, entity]);

    return {
        isEdit,
        headTitle,
        description,
        formProps,
    };
}
