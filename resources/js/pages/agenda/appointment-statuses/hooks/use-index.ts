import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/agenda/appointment-statuses';
import type { AppointmentStatus } from '../types';

export type { AppointmentStatusesIndexPageProps } from '@/pages/agenda/appointment-statuses/config';

export function useAppointmentStatusesIndex() {
    const { deleteRow, deleteConfirmDialog } = useTabledataDeleteRow<AppointmentStatus>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmTitle: () => '¿Eliminar el estado?',
        confirmDescription: (row) =>
            `Se eliminará el estado «${row.name}». Esta acción no se puede deshacer.`,
    });

    return { deleteRow, deleteConfirmDialog };
}
