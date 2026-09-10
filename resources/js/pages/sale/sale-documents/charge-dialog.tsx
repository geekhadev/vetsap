import { useHttp, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
    PosChargePaymentsDialog
    
} from '@/components/custom/pos/charge-payments-dialog';
import type {PosChargeConfirmPayload} from '@/components/custom/pos/charge-payments-dialog';
import type { PosOptionsPayload } from '@/components/custom/pos/types';
import {
    charge as saleDocumentsCharge,
    chargeContext as saleDocumentsChargeContext,
} from '@/routes/sale/sale-documents';
import type { CashRegisterSharedProps } from '@/types/cash-register';

export type SaleDocumentChargeDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    saleDocumentId: string | null;
    onCharged: () => void;
};

type ChargeContextPayload = {
    id: string;
    status: 'draft' | 'issued' | 'voided' | 'merged';
    payment_status: 'pending' | 'partial' | 'paid';
    total_amount: number;
    paid_amount: number;
    balance_amount: number;
    can_charge: boolean;
    requires_issue_fields: boolean;
    payment_type: {
        id: string;
        name: string;
        code: string;
        is_credit: boolean;
    } | null;
    options: Pick<
        PosOptionsPayload,
        | 'payment_methods'
        | 'payment_types'
        | 'sii_tax_document_types'
        | 'cash_round_to'
        | 'cash_round_threshold'
    >;
};

type ChargeContextResponse = {
    data: ChargeContextPayload;
};

export function SaleDocumentChargeDialog({
    open,
    onOpenChange,
    saleDocumentId,
    onCharged,
}: SaleDocumentChargeDialogProps) {
    const { cash_register: cashRegister } = usePage<{
        cash_register: CashRegisterSharedProps;
    }>().props;
    const http = useHttp({});
    const chargeHttp = useHttp({});
    const onOpenChangeRef = useRef(onOpenChange);
    const [loading, setLoading] = useState(false);
    const [charging, setCharging] = useState(false);
    const [context, setContext] = useState<ChargeContextPayload | null>(null);
    const [siiTypeId, setSiiTypeId] = useState('');

    onOpenChangeRef.current = onOpenChange;

    useEffect(() => {
        if (!open || !saleDocumentId) {
            setContext(null);
            setLoading(false);
            setSiiTypeId('');

            return;
        }

        let cancelled = false;

        void (async () => {
            setLoading(true);
            setContext(null);

            try {
                const response = (await http.get(
                    saleDocumentsChargeContext.url(saleDocumentId),
                )) as ChargeContextResponse;

                if (cancelled) {
                    return;
                }

                const payload = response.data;

                if (!payload.can_charge) {
                    toast.error('Este documento no admite cobro.');
                    onOpenChangeRef.current(false);

                    return;
                }

                setContext(payload);
                setSiiTypeId(
                    payload.options.sii_tax_document_types[0]?.id ?? '',
                );
            } catch {
                if (!cancelled) {
                    toast.error('No se pudo cargar el cobro del documento.');
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

    async function handleConfirm(payload: PosChargeConfirmPayload): Promise<void> {
        if (!saleDocumentId || !context) {
            return;
        }

        if (!cashRegister.open) {
            toast.error('Debes tener una caja abierta para cobrar.');

            return;
        }

        if (context.requires_issue_fields && payload.payment_type_id === '') {
            toast.error('Selecciona un tipo de pago válido.');

            return;
        }

        setCharging(true);

        try {
            chargeHttp.transform(() => ({
                cash_register_id: cashRegister.open!.id,
                sii_tax_document_type_id: context.requires_issue_fields
                    ? siiTypeId || null
                    : null,
                payment_type_id: context.requires_issue_fields
                    ? payload.payment_type_id
                    : null,
                payments: payload.payments,
            }));

            await chargeHttp.post(saleDocumentsCharge.url(saleDocumentId));

            toast.success('Cobro registrado correctamente.');
            onOpenChange(false);
            onCharged();
        } catch {
            toast.error('No se pudo registrar el cobro.');
        } finally {
            setCharging(false);
        }
    }

    const dialogOpen = open && !loading && context !== null;
    const chargeAmount = context?.requires_issue_fields
        ? (context?.total_amount ?? 0)
        : (context?.balance_amount ?? 0);

    return (
        <PosChargePaymentsDialog
            key={context?.id ?? 'sale-document-charge'}
            open={dialogOpen}
            onOpenChange={onOpenChange}
            paymentMethods={context?.options.payment_methods ?? []}
            paymentTypes={
                context?.requires_issue_fields
                    ? (context?.options.payment_types ?? [])
                    : context?.payment_type
                      ? [context.payment_type]
                      : []
            }
            totalAmount={chargeAmount}
            cashRoundTo={context?.options.cash_round_to ?? 10}
            cashRoundThreshold={context?.options.cash_round_threshold ?? 5}
            processing={charging}
            lockedPaymentTypeId={
                context?.requires_issue_fields
                    ? null
                    : (context?.payment_type?.id ?? null)
            }
            amountLabel={
                context?.requires_issue_fields ? 'Total' : 'Saldo pendiente'
            }
            siiTaxDocumentTypes={
                context?.requires_issue_fields
                    ? context.options.sii_tax_document_types
                    : undefined
            }
            siiTaxDocumentTypeId={siiTypeId}
            onSiiTaxDocumentTypeIdChange={
                context?.requires_issue_fields ? setSiiTypeId : undefined
            }
            onConfirm={(payload) => {
                void handleConfirm(payload);
            }}
        />
    );
}
