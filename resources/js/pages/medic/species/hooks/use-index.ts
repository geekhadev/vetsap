import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/medic/species';
import type { Species } from '../types';

export type { SpeciesIndexPageProps } from '@/pages/medic/species/config';

export function useSpeciesIndex() {
    const { deleteRow, deleteConfirmDialog } = useTabledataDeleteRow<Species>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmTitle: () => '¿Eliminar la especie?',
        confirmDescription: (row) =>
            `Se eliminará la especie «${row.name}». Esta acción no se puede deshacer.`,
    });

    return { deleteRow, deleteConfirmDialog };
}
