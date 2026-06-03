import { useMemo } from 'react';
import SpecialtiesController from '@/actions/App/Http/Controllers/Medic/SpecialtiesController';
import type { Specialty } from '../types';

export function useSpecialtyForm(entity: Specialty | null) {
    const isEdit = entity !== null;
    const headTitle = isEdit ? 'Editar especialidad' : 'Nueva especialidad';
    const description = isEdit
        ? 'Modifica los datos de la especialidad. Si tiene servicios activos, no podrás desactivarla.'
        : 'Completa el nombre y la descripción de la especialidad.';

    const formProps = useMemo(() => {
        if (isEdit && entity) {
            return SpecialtiesController.update.form({ specialty: entity.id });
        }

        return SpecialtiesController.store.form();
    }, [isEdit, entity]);

    return {
        isEdit,
        headTitle,
        description,
        formProps,
    };
}
