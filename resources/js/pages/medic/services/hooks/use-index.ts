import { router } from '@inertiajs/react';
import { useCallback } from 'react';
import { TABLEDATA_LIST_INERTIA_ONLY } from '@/components/custom/tabledata';
import { destroy } from '@/routes/medic/services';
import type { Service } from '../types';

export type { ServicesIndexPageProps } from '@/pages/medic/services/config';

export function useServicesIndex() {
    const deleteRow = useCallback((row: Service) => {
        if (
            !window.confirm(
                `¿Eliminar el servicio «${row.name}»? Esta acción no se puede deshacer.`,
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
