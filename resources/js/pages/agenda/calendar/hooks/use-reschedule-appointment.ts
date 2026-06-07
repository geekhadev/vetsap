import { router, useHttp } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import AppointmentsController from '@/actions/App/Http/Controllers/Agenda/AppointmentsController';
import { resolveHttpValidationMessage } from '@/pages/agenda/calendar/schedule-availability';
import type {
    AppointmentDetail,
    AppointmentScheduleValue,
} from '@/pages/agenda/calendar/types';

export function useRescheduleAppointment() {
    const scheduleHttp = useHttp({
        appointment_date: '',
        starts_at_time: '',
    });
    const [rescheduling, setRescheduling] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const reschedule = useCallback(
        async (
            appointmentId: string,
            schedule: AppointmentScheduleValue,
        ): Promise<AppointmentDetail | null> => {
            setRescheduling(true);
            setError(null);

            try {
                scheduleHttp.transform(() => ({
                    appointment_date: schedule.appointmentDate,
                    starts_at_time: schedule.startsAtTime,
                }));

                const data = (await scheduleHttp.patch(
                    AppointmentsController.updateSchedule.url(appointmentId),
                )) as AppointmentDetail;

                toast.success('Cita reagendada correctamente.');
                router.reload({ only: ['appointments'] });

                return data;
            } catch (caughtError: unknown) {
                setError(
                    resolveHttpValidationMessage(
                        caughtError,
                        ['appointment_date', 'starts_at_time'],
                        'No se pudo reagendar la cita.',
                    ),
                );

                return null;
            } finally {
                setRescheduling(false);
            }
        },
        [scheduleHttp],
    );

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        reschedule,
        rescheduling,
        error,
        clearError,
    };
}
