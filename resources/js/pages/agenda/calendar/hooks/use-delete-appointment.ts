import { router } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import AppointmentsController from '@/actions/App/Http/Controllers/Agenda/AppointmentsController';

type UseDeleteAppointmentOptions = {
    onDeleted?: () => void;
};

export function useDeleteAppointment({ onDeleted }: UseDeleteAppointmentOptions = {}) {
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteAppointment = useCallback(
        (appointmentId: string) => {
            setDeleting(true);
            setError(null);

            router.delete(AppointmentsController.destroy.url(appointmentId), {
                preserveScroll: true,
                only: ['appointments'],
                onSuccess: () => {
                    onDeleted?.();
                },
                onError: () => {
                    setError('No se pudo eliminar la cita.');
                },
                onFinish: () => {
                    setDeleting(false);
                },
            });
        },
        [onDeleted],
    );

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        deleteAppointment,
        deleting,
        error,
        clearError,
    };
}
