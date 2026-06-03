import { router } from '@inertiajs/react';
import { useCallback } from 'react';
import { TABLEDATA_LIST_INERTIA_ONLY } from '@/components/custom/tabledata';
import { destroy } from '@/routes/medic/specialties';
import type { Specialty } from '../types';

export type { SpecialtiesIndexPageProps } from '@/pages/medic/specialties/config';

export function useSpecialtiesIndex() {
    const deleteRow = useCallback((row: Specialty) => {
        if (
            !window.confirm(
                `¿Eliminar la especialidad «${row.name}»? Esta acción no se puede deshacer.`,
            )
        ) {
            return;
        }

        router.delete(destroy.url(row.id), {
            preserveScroll: true,
            only: [...TABLEDATA_LIST_INERTIA_ONLY],
        });
    }, []);

    return {
        deleteRow,
    };
}
