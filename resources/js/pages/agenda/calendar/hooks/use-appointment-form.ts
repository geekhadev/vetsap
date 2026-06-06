import { useMemo } from 'react';
import AppointmentsController from '@/actions/App/Http/Controllers/Agenda/AppointmentsController';

export function useAppointmentForm() {
    const formProps = useMemo(() => AppointmentsController.store.form(), []);

    return {
        headTitle: 'Nueva cita',
        description: 'Completa los datos para agendar una cita en el calendario.',
        formProps,
    };
}
