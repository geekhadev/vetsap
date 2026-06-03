import { router } from '@inertiajs/react';
import { useCallback } from 'react';
import { TABLEDATA_LIST_INERTIA_ONLY } from '@/components/custom/tabledata';
import { destroy } from '@/routes/medic/species';
import type { Species } from '../types';

export type { SpeciesIndexPageProps } from '@/pages/medic/species/config';

export function useSpeciesIndex() {
    const deleteRow = useCallback((row: Species) => {
        if (
            !window.confirm(
                `¿Eliminar la especie «${row.name}»? Esta acción no se puede deshacer.`,
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
