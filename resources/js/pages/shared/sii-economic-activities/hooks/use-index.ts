/**
 * Hook mínimo del índice de actividades económicas SII: acciones fuera de `TabledataProvider` + Inertia list.
 */
import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/shared/sii-economic-activities';
import type { SiiEconomicActivity } from '../types';

export type { SiiEconomicActivitiesIndexPageProps } from '@/pages/shared/sii-economic-activities/config';

export function useSiiEconomicActivitiesIndex() {
    const { deleteRow, deleteConfirmDialog } = useTabledataDeleteRow<SiiEconomicActivity>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmTitle: () => '¿Eliminar la actividad?',
        confirmDescription: (row) =>
            `Se eliminará la actividad «${row.code} — ${row.description}». Esta acción no se puede deshacer.`,
    });

    return { deleteRow, deleteConfirmDialog };
}
