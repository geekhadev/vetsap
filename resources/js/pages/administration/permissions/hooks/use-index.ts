/**
 * Hook del índice de permisos: borrado y acceso Owner por selección.
 */
import { router } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/administration/permissions';
import { bulk as bulkOwnerAccess } from '@/routes/administration/permissions/owner-access';
import type { Permission } from '../types';

export type { PermissionsIndexPageProps } from '@/pages/administration/permissions/config';

export function usePermissionsIndex() {
    const { deleteRow, deleteConfirmDialog } = useTabledataDeleteRow<Permission>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmTitle: () => '¿Eliminar el permiso?',
        confirmDescription: (row) =>
            `Se eliminará el permiso «${row.name}».Esta acción no se puede deshacer.`,
    });

    const [ownerBulkPending, setOwnerBulkPending] = useState(false);

    const bulkSetOwnerEnabled = useCallback(
        (
            permissionIds: string[],
            enabled: boolean,
            onSuccess?: () => void,
        ) => {
            if (permissionIds.length === 0) {
                return;
            }

            setOwnerBulkPending(true);

            router.put(
                bulkOwnerAccess.url(),
                {
                    enabled,
                    permission_ids: permissionIds,
                },
                {
                    preserveScroll: true,
                    only: ['data'],
                    onSuccess: () => {
                        onSuccess?.();
                    },
                    onFinish: () => {
                        setOwnerBulkPending(false);
                    },
                },
            );
        },
        [],
    );

    return {
        deleteRow,
        deleteConfirmDialog,
        bulkSetOwnerEnabled,
        ownerBulkPending,
    };
}
