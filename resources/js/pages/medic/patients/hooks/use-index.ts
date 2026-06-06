import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/medic/patients';
import type { Patient } from '../types';

export type { PatientsIndexPageProps } from '@/pages/medic/patients/config';

export function usePatientsIndex() {
    const { deleteRow } = useTabledataDeleteRow<Patient>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmMessage: (row) =>
            `¿Eliminar al paciente «${row.name}»? Esta acción no se puede deshacer.`,
    });

    return { deleteRow };
}
