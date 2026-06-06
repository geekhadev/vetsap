import { useMemo } from 'react';
import AppointmentStatusesController from '@/actions/App/Http/Controllers/Agenda/AppointmentStatusesController';
import type { AppointmentStatus } from '../types';

export function useAppointmentStatusesForm(entity: AppointmentStatus | null) {
    const isEdit = entity !== null;
    const headTitle = isEdit ? 'Editar estado de cita' : 'Nuevo estado de cita';
    const description = isEdit
        ? 'Modifica el nombre, color y estado del registro.'
        : 'Indica el nombre y el color con el que se mostrará en la agenda.';

    const formProps = useMemo(() => {
        if (isEdit && entity) {
            return AppointmentStatusesController.update.form({
                appointment_status: entity.id,
            });
        }

        return AppointmentStatusesController.store.form();
    }, [isEdit, entity]);

    return {
        isEdit,
        headTitle,
        description,
        formProps,
    };
}
