import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/medic/services';
import type { Service } from '../types';

export type { ServicesIndexPageProps } from '@/pages/medic/services/config';

export function useServicesIndex() {
    const { deleteRow, deleteConfirmDialog } = useTabledataDeleteRow<Service>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmTitle: () => '¿Eliminar el servicio?',
        confirmDescription: (row) =>
            `Se eliminará el servicio «${row.name}». Esta acción no se puede deshacer.`,
    });

    return { deleteRow, deleteConfirmDialog };
}
