import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/medic/specialties';
import type { Specialty } from '../types';

export type { SpecialtiesIndexPageProps } from '@/pages/medic/specialties/config';

export function useSpecialtiesIndex() {
    const { deleteRow } = useTabledataDeleteRow<Specialty>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmMessage: (row) =>
            `¿Eliminar la especialidad «${row.name}»? Esta acción no se puede deshacer.`,
    });

    return { deleteRow };
}
