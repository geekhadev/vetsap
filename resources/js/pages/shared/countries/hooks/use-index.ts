/**
 * Hook mínimo del índice de países: acciones fuera de `TabledataProvider` + Inertia list.
 */
import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/shared/countries';
import type { Country } from '../types';

export type { CountriesIndexPageProps } from '@/pages/shared/countries/config';

export function useCountriesIndex() {
    const { deleteRow, deleteConfirmDialog } = useTabledataDeleteRow<Country>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmTitle: () => '¿Eliminar el país?',
        confirmDescription: (row) =>
            `Se eliminará el país «${row.name}».Esta acción no se puede deshacer.`,
    });

    return { deleteRow, deleteConfirmDialog };
}
