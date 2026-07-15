/**
 * Hook mínimo del índice de módulos: borrado parcial Inertia.
 */
import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/administration/modules';
import type { Module } from '../types';

export type { ModulesIndexPageProps } from '@/pages/administration/modules/config';

export function useModulesIndex() {
    const { deleteRow, deleteConfirmDialog } = useTabledataDeleteRow<Module>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmTitle: () => '¿Eliminar el módulo?',
        confirmDescription: (row) =>
            `Se eliminará el módulo «${row.name}».Esta acción no se puede deshacer.`,
    });

    return { deleteRow, deleteConfirmDialog };
}
