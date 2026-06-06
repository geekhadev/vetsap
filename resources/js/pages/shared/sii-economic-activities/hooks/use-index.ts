/**
 * Hook mínimo del índice de actividades económicas SII: acciones fuera de `TabledataProvider` + Inertia list.
 */
import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/shared/sii-economic-activities';
import type { SiiEconomicActivity } from '../types';

export type { SiiEconomicActivitiesIndexPageProps } from '@/pages/shared/sii-economic-activities/config';

export function useSiiEconomicActivitiesIndex() {
    const { deleteRow } = useTabledataDeleteRow<SiiEconomicActivity>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmMessage: (row) =>
            `¿Eliminar la actividad «${row.code} — ${row.description}»?`,
    });

    return { deleteRow };
}
