import { router } from '@inertiajs/react';
import { createElement, useCallback, useState } from 'react';
import { ConfirmDialog } from '@/components/custom/confirm-dialog';
import { TABLEDATA_LIST_INERTIA_ONLY } from '@/components/custom/tabledata';

type UseTabledataDeleteRowParams<T> = {
    getDestroyUrl: (row: T) => string;
    confirmTitle: (row: T) => string;
    confirmDescription: (row: T) => string;
    confirmLabel?: string;
    only?: readonly string[];
    onError?: (errors: Record<string, string | string[]>) => void;
};

export function useTabledataDeleteRow<T>({
    getDestroyUrl,
    confirmTitle,
    confirmDescription,
    confirmLabel = 'Eliminar',
    only = TABLEDATA_LIST_INERTIA_ONLY,
    onError,
}: UseTabledataDeleteRowParams<T>) {
    const [pendingRow, setPendingRow] = useState<T | null>(null);
    const [deleting, setDeleting] = useState(false);

    const deleteRow = useCallback((row: T) => {
        setPendingRow(row);
    }, []);

    const handleOpenChange = useCallback(
        (open: boolean) => {
            if (!open && !deleting) {
                setPendingRow(null);
            }
        },
        [deleting],
    );

    const handleConfirm = useCallback(() => {
        if (pendingRow === null) {
            return;
        }

        setDeleting(true);

        router.delete(getDestroyUrl(pendingRow), {
            preserveScroll: true,
            only: [...only],
            onSuccess: () => {
                setPendingRow(null);
            },
            onFinish: () => {
                setDeleting(false);
            },
            ...(onError ? { onError } : {}),
        });
    }, [getDestroyUrl, onError, only, pendingRow]);

    const deleteConfirmDialog = createElement(ConfirmDialog, {
        open: pendingRow !== null,
        onOpenChange: handleOpenChange,
        title: pendingRow ? confirmTitle(pendingRow) : '',
        description: pendingRow ? confirmDescription(pendingRow) : '',
        confirmLabel: deleting ? 'Eliminando…' : confirmLabel,
        confirmVariant: 'destructive',
        confirming: deleting,
        onConfirm: handleConfirm,
    });

    return { deleteRow, deleteConfirmDialog };
}
