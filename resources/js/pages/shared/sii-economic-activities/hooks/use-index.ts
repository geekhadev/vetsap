/**
 * Hook mínimo del índice de actividades económicas SII: acciones fuera de `TabledataProvider` + Inertia list.
 */
import { router } from '@inertiajs/react';
import { useCallback } from 'react';
import { TABLEDATA_LIST_INERTIA_ONLY } from '@/components/custom/tabledata';
import { destroy } from '@/routes/shared/sii-economic-activities';
import type { SiiEconomicActivity } from '../types';

export type { SiiEconomicActivitiesIndexPageProps } from '@/pages/shared/sii-economic-activities/config';

export function useSiiEconomicActivitiesIndex() {
    const deleteRow = useCallback((row: SiiEconomicActivity) => {
        if (
            !window.confirm(
                `¿Eliminar la actividad «${row.code} — ${row.description}»?`,
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
