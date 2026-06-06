import { toast } from 'sonner';
import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/configuration/users';
import type { UserListRow } from '../types';

export function useUsersIndex() {
    const { deleteRow } = useTabledataDeleteRow<UserListRow>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmMessage: (row) =>
            `¿Eliminar al usuario «${row.name}»? Esta acción no se puede deshacer.`,
        onError: (errors) => {
            const raw = errors.user;
            const msg = Array.isArray(raw) ? raw[0] : raw;
            toast.error(
                typeof msg === 'string'
                    ? msg
                    : 'No se pudo eliminar el usuario.',
            );
        },
    });

    return { deleteRow };
}
