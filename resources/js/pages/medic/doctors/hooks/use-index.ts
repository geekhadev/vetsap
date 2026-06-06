import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/medic/doctors';
import { formatDoctorName } from '../types';
import type { Doctor } from '../types';

export type { DoctorsIndexPageProps } from '@/pages/medic/doctors/config';

export function useDoctorsIndex() {
    const { deleteRow } = useTabledataDeleteRow<Doctor>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmMessage: (row) =>
            `¿Eliminar al doctor «${formatDoctorName(row)}»? Esta acción no se puede deshacer.`,
    });

    return { deleteRow };
}
