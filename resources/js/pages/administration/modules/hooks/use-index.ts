/**
 * Hook mínimo del índice de módulos: borrado parcial Inertia.
 */
import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/administration/modules';
import type { Module } from '../types';

export type { ModulesIndexPageProps } from '@/pages/administration/modules/config';

export function useModulesIndex() {
    const { deleteRow } = useTabledataDeleteRow<Module>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmMessage: (row) => `¿Eliminar el módulo «${row.name}»?`,
    });

    return { deleteRow };
}
