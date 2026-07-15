/**
 * Hook mínimo del índice de permisos: borrado parcial Inertia.
 */
import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/administration/permissions';
import type { Permission } from '../types';

export type { PermissionsIndexPageProps } from '@/pages/administration/permissions/config';

export function usePermissionsIndex() {
    const { deleteRow, deleteConfirmDialog } = useTabledataDeleteRow<Permission>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmTitle: () => '¿Eliminar el permiso?',
        confirmDescription: (row) =>
            `Se eliminará el permiso «${row.name}».Esta acción no se puede deshacer.`,
    });

    return { deleteRow, deleteConfirmDialog };
}
