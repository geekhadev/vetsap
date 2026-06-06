/**
 * Hook mínimo del índice de países: acciones fuera de `TabledataProvider` + Inertia list.
 */
import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/shared/countries';
import type { Country } from '../types';

export type { CountriesIndexPageProps } from '@/pages/shared/countries/config';

export function useCountriesIndex() {
    const { deleteRow } = useTabledataDeleteRow<Country>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmMessage: (row) => `¿Eliminar el país «${row.name}»?`,
    });

    return { deleteRow };
}
