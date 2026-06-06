import { useHttp } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import AppointmentsController from '@/actions/App/Http/Controllers/Agenda/AppointmentsController';
import type { AppointmentDetail } from '@/pages/agenda/calendar/types';

export function useAppointmentDetail() {
    const { submit } = useHttp();
    const [appointment, setAppointment] = useState<AppointmentDetail | null>(
        null,
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAppointment = useCallback(
        async (appointmentId: string) => {
            setLoading(true);
            setError(null);
            setAppointment(null);

            try {
                const data = (await submit(
                    AppointmentsController.show(appointmentId),
                )) as AppointmentDetail;

                setAppointment(data);
            } catch {
                setError('No se pudo cargar la cita.');
            } finally {
                setLoading(false);
            }
        },
        [submit],
    );

    const reset = useCallback(() => {
        setAppointment(null);
        setError(null);
        setLoading(false);
    }, []);

    return {
        appointment,
        loading,
        error,
        fetchAppointment,
        reset,
    };
}
