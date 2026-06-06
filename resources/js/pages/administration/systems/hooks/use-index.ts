/**
 * Hook mínimo del índice de sistemas: acciones fuera de `TabledataProvider` + Inertia list.
 */
import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/administration/systems';
import type { System } from '../types';

export type { SystemsIndexPageProps } from '@/pages/administration/systems/config';

export function useSystemsIndex() {
    const { deleteRow } = useTabledataDeleteRow<System>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmMessage: (row) => `¿Eliminar el sistema «${row.name}»?`,
    });

    return { deleteRow };
}
