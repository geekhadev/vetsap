import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/medic/species';
import type { Species } from '../types';

export type { SpeciesIndexPageProps } from '@/pages/medic/species/config';

export function useSpeciesIndex() {
    const { deleteRow } = useTabledataDeleteRow<Species>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmMessage: (row) =>
            `¿Eliminar la especie «${row.name}»? Esta acción no se puede deshacer.`,
    });

    return { deleteRow };
}
