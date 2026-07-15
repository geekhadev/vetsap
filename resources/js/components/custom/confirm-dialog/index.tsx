import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import type { ConfirmDialogProps } from './types';

export type { ConfirmDialogProps, ConfirmDialogVariant } from './types';

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    cancelLabel = 'Cancelar',
    confirmLabel,
    confirmVariant = 'default',
    confirming = false,
    onConfirm,
}: ConfirmDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={confirming}>{cancelLabel}</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={confirming}
                        className={cn(
                            confirmVariant === 'destructive' &&
                                buttonVariants({ variant: 'destructive' }),
                        )}
                        onClick={(event) => {
                            event.preventDefault();
                            onConfirm();
                        }}
                    >
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
