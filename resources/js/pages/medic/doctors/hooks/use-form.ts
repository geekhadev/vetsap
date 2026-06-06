import { useMemo } from 'react';
import DoctorsController from '@/actions/App/Http/Controllers/Medic/DoctorsController';
import type { Doctor } from '../types';

export function useDoctorForm(entity: Doctor | null) {
    const isEdit = entity !== null;
    const headTitle = isEdit ? 'Editar doctor' : 'Nuevo doctor';
    const description = isEdit
        ? 'Modifica la ficha del profesional y los servicios que puede prestar. El tipo y número de documento no se pueden cambiar.'
        : 'Registra un veterinario o profesional. Podrás asignar servicios al editar la ficha.';

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
