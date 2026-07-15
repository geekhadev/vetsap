import type { ReactNode } from 'react';

export type ConfirmDialogVariant = 'default' | 'destructive';

export type ConfirmDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: ReactNode;
    description: ReactNode;
    cancelLabel?: string;
    confirmLabel: string;
    confirmVariant?: ConfirmDialogVariant;
    confirming?: boolean;
    onConfirm: () => void;
};
