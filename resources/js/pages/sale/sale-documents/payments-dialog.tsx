import { useHttp } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { CurrencyDisplay } from '@/components/custom/currency-display';
import { DateDisplay } from '@/components/custom/date-display';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type {
    SaleDocumentPaymentsDialogProps,
    SaleDocumentPaymentsPayload,
} from '@/pages/sale/sale-documents/payments-dialog-types';
import { payments as saleDocumentsPayments } from '@/routes/sale/sale-documents';

type PaymentsResponse = {
    data: SaleDocumentPaymentsPayload;
};

export function SaleDocumentPaymentsDialog({
    open,
    onOpenChange,
    saleDocumentId,
}: SaleDocumentPaymentsDialogProps) {
    const http = useHttp({});
    const onOpenChangeRef = useRef(onOpenChange);
    const [loading, setLoading] = useState(false);
    const [payload, setPayload] = useState<SaleDocumentPaymentsPayload | null>(
        null,
    );

    onOpenChangeRef.current = onOpenChange;

    useEffect(() => {
        if (!open || !saleDocumentId) {
            setPayload(null);
            setLoading(false);

            return;
        }

        let cancelled = false;

        void (async () => {
            setLoading(true);
            setPayload(null);

            try {
                const response = (await http.get(
                    saleDocumentsPayments.url(saleDocumentId),
                )) as PaymentsResponse;

                if (!cancelled) {
                    setPayload(response.data);
                }
            } catch {
                if (!cancelled) {
                    toast.error('No se pudo cargar el detalle de pagos.');
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
        // eslint-disable-next-line react-hooks/exhaustive-deps -- load when dialog opens for a document
    }, [open, saleDocumentId]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Pagos del documento</DialogTitle>
                    <DialogDescription>
                        Detalle de los pagos registrados para este documento de
                        venta.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="text-muted-foreground flex items-center justify-center gap-2 py-10 text-sm">
                        <LoaderCircle className="size-4 animate-spin" />
                        Cargando pagos…
                    </div>
                ) : payload ? (
                    <div className="space-y-4">
                        <div className="bg-muted/40 grid gap-2 rounded-md border px-3 py-2 text-sm sm:grid-cols-3">
                            <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-start sm:justify-start">
                                <span className="text-muted-foreground">
                                    Total
                                </span>
                                <CurrencyDisplay value={payload.total_amount} />
                            </div>
                            <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-start sm:justify-start">
                                <span className="text-muted-foreground">
                                    Pagado
                                </span>
                                <CurrencyDisplay value={payload.paid_amount} />
                            </div>
                            <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-start sm:justify-start">
                                <span className="text-muted-foreground">
                                    Saldo
                                </span>
                                <CurrencyDisplay
                                    value={payload.balance_amount}
                                />
                            </div>
                        </div>

                        {payload.payments.length === 0 ? (
                            <p className="text-muted-foreground py-6 text-center text-sm">
                                Sin pagos registrados.
                            </p>
                        ) : (
                            <div className="overflow-hidden rounded-md border">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50 text-muted-foreground">
                                        <tr className="border-b text-left">
                                            <th className="px-3 py-2 font-medium">
                                                Fecha
                                            </th>
                                            <th className="px-3 py-2 font-medium">
                                                Método
                                            </th>
                                            <th className="px-3 py-2 font-medium">
                                                Usuario
                                            </th>
                                            <th className="px-3 py-2 text-right font-medium">
                                                Monto
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payload.payments.map((payment) => (
                                            <tr
                                                key={payment.id}
                                                className="border-b last:border-b-0"
                                            >
                                                <td className="px-3 py-2">
                                                    {payment.paid_at ? (
                                                        <DateDisplay
                                                            value={
                                                                payment.paid_at
                                                            }
                                                            mode="datetime"
                                                        />
                                                    ) : (
                                                        '—'
                                                    )}
                                                </td>
                                                <td className="px-3 py-2">
                                                    {payment.payment_method
                                                        ?.name ?? '—'}
                                                </td>
                                                <td className="px-3 py-2">
                                                    {payment.created_by
                                                        ?.name ?? '—'}
                                                </td>
                                                <td className="px-3 py-2 text-right">
                                                    <CurrencyDisplay
                                                        value={payment.amount}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
