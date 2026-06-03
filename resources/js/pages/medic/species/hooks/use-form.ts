import { useMemo } from 'react';
import SpeciesController from '@/actions/App/Http/Controllers/Medic/SpeciesController';
import type { Species } from '../types';

export function useSpeciesForm(entity: Species | null) {
    const isEdit = entity !== null;
    const headTitle = isEdit ? 'Editar especie' : 'Nueva especie';
    const description = isEdit
        ? 'Modifica los datos de la especie.'
        : 'Completa el nombre y estado de la especie.';

    const formProps = useMemo(() => {
        if (isEdit && entity) {
            return SpeciesController.update.form({ species: entity.id });
        }

        return SpeciesController.store.form();
    }, [isEdit, entity]);

    return {
        isEdit,
        headTitle,
        description,
        formProps,
    };
}
