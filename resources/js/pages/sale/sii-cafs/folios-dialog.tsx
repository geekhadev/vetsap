import { DateDisplay } from '@/components/custom/date-display';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type {
    FoliosForModalPayload,
    SiiCafFolioStatusValue,
} from '@/pages/sale/sii-cafs/types';

const FOLIO_STATUS_LABEL: Record<SiiCafFolioStatusValue, string> = {
    available: 'Disponible',
    draft: 'Borrador',
    used: 'Usado',
    expired: 'Vencido',
};

function folioStatusBadgeVariant(
    status: SiiCafFolioStatusValue,
): 'default' | 'secondary' | 'destructive' | 'outline' {
    if (status === 'used') {
        return 'default';
    }

    if (status === 'expired') {
        return 'destructive';
    }

    if (status === 'draft') {
        return 'secondary';
    }

    return 'outline';
}

type FoliosDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    payload: FoliosForModalPayload | null;
};

export function FoliosDialog({ open, onOpenChange, payload }: FoliosDialogProps) {
    const caf = payload?.caf;
    const folios = payload?.folios ?? [];
    const truncated = payload?.truncated ?? false;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
                <DialogHeader className="border-border shrink-0 border-b px-6 py-4 text-left">
                    <DialogTitle>Folios del CAF</DialogTitle>
                    <DialogDescription>
                        {caf
                            ? `${caf.document_type_name} (${caf.document_type_code}) — rango ${caf.folio_from}–${caf.folio_to}`
                            : '—'}
                    </DialogDescription>
                </DialogHeader>

                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
                    {truncated ? (
                        <Alert className="mb-4" variant="destructive">
                            <AlertTitle>Listado truncado</AlertTitle>
                            <AlertDescription>
                                Solo se muestran los primeros 5000 folios. Reduce el rango o
                                contacta soporte si necesitas exportar el detalle completo.
                            </AlertDescription>
                        </Alert>
                    ) : null}

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Folio</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Fecha de uso</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {folios.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-muted-foreground">
                                        Sin folios cargados.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                folios.map((f) => (
                                    <TableRow key={f.id}>
                                        <TableCell className="font-mono tabular-nums">
                                            {f.folio_number}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={folioStatusBadgeVariant(f.status)}>
                                                {FOLIO_STATUS_LABEL[f.status]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground text-sm">
                                            {f.used_at ? (
                                                <DateDisplay
                                                    value={f.used_at}
                                                    mode="datetime"
                                                />
                                            ) : (
                                                '—'
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    );
}
