import { useMemo } from 'react';
import PatientsController from '@/actions/App/Http/Controllers/Medic/PatientsController';
import type { Patient } from '../types';

type UsePatientFormOptions = {
    entity: Patient | null;
    redirectTo?: 'customers' | 'patients';
};

export function usePatientForm({ entity, redirectTo = 'patients' }: UsePatientFormOptions) {
    const isEdit = entity !== null;
    const headTitle = isEdit ? 'Editar paciente' : 'Nuevo paciente';
    const description = isEdit
        ? 'Modifica la ficha clínica del paciente.'
        : 'Completa los datos del paciente.';

    const formProps = useMemo(() => {
        if (isEdit && entity) {
            return PatientsController.update.form({ patient: entity.id });
        }

        return PatientsController.store.form();
    }, [isEdit, entity]);

    return {
        isEdit,
        headTitle,
        description,
        formProps,
        redirectTo,
    };
}
