import { router } from '@inertiajs/react';
import { useCallback } from 'react';
import { TABLEDATA_LIST_INERTIA_ONLY } from '@/components/custom/tabledata';

type UseTabledataDeleteRowParams<T> = {
    getDestroyUrl: (row: T) => string;
    confirmMessage: (row: T) => string;
    only?: readonly string[];
};

export function useTabledataDeleteRow<T>({
    getDestroyUrl,
    confirmMessage,
    only = TABLEDATA_LIST_INERTIA_ONLY,
}: UseTabledataDeleteRowParams<T>) {
    const deleteRow = useCallback(
        (row: T) => {
            if (!window.confirm(confirmMessage(row))) {
                return;
            }

            router.delete(getDestroyUrl(row), {
                preserveScroll: true,
                only: [...only],
            });
        },
        [confirmMessage, getDestroyUrl, only],
    );

    return { deleteRow };
}
