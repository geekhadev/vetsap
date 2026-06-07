import { router, useHttp } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import AppointmentsController from '@/actions/App/Http/Controllers/Agenda/AppointmentsController';
import type { AppointmentDetail } from '@/pages/agenda/calendar/types';

export function useChangeAppointmentStatus() {
    const statusHttp = useHttp({ appointment_status_id: '' });
    const [changing, setChanging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const changeStatus = useCallback(
        async (
            appointmentId: string,
            appointmentStatusId: string,
        ): Promise<AppointmentDetail | null> => {
            setChanging(true);
            setError(null);

            try {
                statusHttp.transform(() => ({
                    appointment_status_id: appointmentStatusId,
                }));

                const data = (await statusHttp.patch(
                    AppointmentsController.updateStatus.url(appointmentId),
                )) as AppointmentDetail;

                toast.success('Estado de la cita actualizado correctamente.');
                router.reload({ only: ['appointments'] });

                return data;
            } catch {
                setError('No se pudo actualizar el estado de la cita.');

                return null;
            } finally {
                setChanging(false);
            }
        },
        [statusHttp],
    );

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        changeStatus,
        changing,
        error,
        clearError,
    };
}
