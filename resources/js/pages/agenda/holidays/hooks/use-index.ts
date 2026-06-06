import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/agenda/holidays';
import type { Holiday } from '../types';

export type { HolidaysIndexPageProps } from '@/pages/agenda/holidays/config';

export function useHolidaysIndex() {
    const { deleteRow } = useTabledataDeleteRow<Holiday>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmMessage: (row) =>
            `¿Eliminar el día feriado «${row.name}»? Esta acción no se puede deshacer.`,
    });

    return { deleteRow };
}
