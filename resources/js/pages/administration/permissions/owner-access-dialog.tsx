import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type OwnerAccessDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedCount: number;
    pending: boolean;
    onActivate: () => void;
    onDeactivate: () => void;
};

export function OwnerAccessDialog({
    open,
    onOpenChange,
    selectedCount,
    pending,
    onActivate,
    onDeactivate,
}: OwnerAccessDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Acceso Owner</DialogTitle>
                    <DialogDescription>
                        {selectedCount === 1
                            ? '1 permiso seleccionado. Elegí si el rol Owner puede usarlo.'
                            : `${selectedCount} permisos seleccionados. Elegí si el rol Owner puede usarlos.`}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={pending}
                        onClick={() => {
                            onOpenChange(false);
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={pending || selectedCount === 0}
                        onClick={onDeactivate}
                    >
                        Desactivar
                    </Button>
                    <Button
                        type="button"
                        disabled={pending || selectedCount === 0}
                        onClick={onActivate}
                    >
                        Activar para Owner
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
