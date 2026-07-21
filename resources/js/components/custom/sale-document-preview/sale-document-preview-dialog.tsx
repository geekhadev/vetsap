import { useHttp } from '@inertiajs/react';
import { FileText, LoaderCircle, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/custom/confirm-dialog';
import { SaleDocumentDtePaper } from '@/components/custom/sale-document-preview/sale-document-dte-paper';
import type {
    SaleDocumentPreview,
    SaleDocumentPreviewDialogProps,
} from '@/components/custom/sale-document-preview/types';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    destroy as saleDocumentsDestroy,
    show as saleDocumentsShow,
} from '@/routes/sale/sale-documents';

type PreviewResponse = {
    data: SaleDocumentPreview;
};

export function SaleDocumentPreviewDialog({
    open,
    onOpenChange,
    saleDocumentId,
    onDeleted,
}: SaleDocumentPreviewDialogProps) {
    const http = useHttp({});
    const onOpenChangeRef = useRef(onOpenChange);
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [document, setDocument] = useState<SaleDocumentPreview | null>(null);

    onOpenChangeRef.current = onOpenChange;

    useEffect(() => {
        if (!open || !saleDocumentId) {
            setDocument(null);
            setLoading(false);
            setConfirmDeleteOpen(false);
            setDeleting(false);

            return;
        }

        let cancelled = false;

        void (async () => {
            setLoading(true);
            setDocument(null);

            try {
                const response = (await http.get(
                    saleDocumentsShow.url(saleDocumentId),
                )) as PreviewResponse;

                if (!cancelled) {
                    setDocument(response.data);
                }
            } catch {
                if (!cancelled) {
                    toast.error(
                        'No se pudo cargar la vista previa del documento.',
                    );
                    onOpenChangeRef.current(false);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
        // Solo recargar al abrir o cambiar el documento.
        // eslint-disable-next-line react-hooks/exhaustive-deps -- http identity is unstable
    }, [open, saleDocumentId]);

    async function handleConfirmDelete(): Promise<void> {
        if (!document || deleting) {
            return;
        }

        setDeleting(true);

        try {
            await http.delete(saleDocumentsDestroy.url(document.id));
            toast.success('Documento de venta eliminado.');
            setConfirmDeleteOpen(false);
            onOpenChange(false);
            onDeleted?.(document.id);
        } catch {
            toast.error('No se pudo eliminar el documento.');
        } finally {
            setDeleting(false);
        }
    }

    const canDelete = document?.can.delete === true;

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="flex h-[min(92vh,56rem)] max-h-[min(92vh,56rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[calc(8.5in+3rem)]">
                    <DialogHeader className="shrink-0 border-b px-6 py-4">
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="size-5" />
                            Vista previa del documento
                        </DialogTitle>
                        <DialogDescription>
                            Representación impresa en hoja carta del documento
                            tributario electrónico del SII.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="min-h-0 flex-1 overflow-y-auto bg-neutral-300 p-6 dark:bg-neutral-700">
                        {loading ? (
                            <div className="flex h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
                                <LoaderCircle className="size-4 animate-spin" />
                                Cargando documento…
                            </div>
                        ) : document ? (
                            <SaleDocumentDtePaper document={document} />
                        ) : (
                            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                                Sin documento para mostrar.
                            </div>
                        )}
                    </div>

                    <div className="flex shrink-0 items-center justify-between gap-3 border-t px-6 py-3">
                        {canDelete ? (
                            <Button
                                type="button"
                                variant="destructive"
                                disabled={loading || deleting}
                                onClick={() => setConfirmDeleteOpen(true)}
                            >
                                <Trash2 className="size-4" />
                                Eliminar
                            </Button>
                        ) : (
                            <span />
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cerrar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={confirmDeleteOpen}
                onOpenChange={(nextOpen) => {
                    if (!deleting) {
                        setConfirmDeleteOpen(nextOpen);
                    }
                }}
                title="Eliminar documento de venta"
                description="Se eliminará el documento, sus detalles y pagos asociados. Esta acción no se puede deshacer."
                confirmLabel={deleting ? 'Eliminando…' : 'Eliminar'}
                confirmVariant="destructive"
                confirming={deleting}
                onConfirm={() => {
                    void handleConfirmDelete();
                }}
            />
        </>
    );
}
