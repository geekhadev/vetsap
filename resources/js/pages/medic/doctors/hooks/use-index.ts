import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/medic/doctors';
import { formatDoctorName } from '../types';
import type { Doctor } from '../types';

export type { DoctorsIndexPageProps } from '@/pages/medic/doctors/config';

export function useDoctorsIndex() {
    const { deleteRow, deleteConfirmDialog } = useTabledataDeleteRow<Doctor>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmTitle: () => '¿Eliminar al doctor?',
        confirmDescription: (row) =>
            `Se eliminará al doctor «${formatDoctorName(row)}». Esta acción no se puede deshacer.`,
    });

    return { deleteRow, deleteConfirmDialog };
}
