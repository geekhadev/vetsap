import { useCallback, useMemo, useState } from 'react';
import type {
    PosCartLine,
    PosCustomerAttentionsPayload,
    PosCustomerDetail,
    PosDraftAttention,
    PosLineType,
    PosTotalsBreakdown,
} from '@/components/custom/pos/types';
import {
    EMPTY_POS_TOTALS,
    posLineSubtotal,
} from '@/components/custom/pos/types';

function lineKey(parts: string[]): string {
    return parts.join(':');
}

function detailsToLines(attentions: PosDraftAttention[]): PosCartLine[] {
    const lines: PosCartLine[] = [];

    for (const attention of attentions) {
        for (const detail of attention.services) {
            const detailType = (detail.detail_type ?? 'service') as PosLineType;
            const detailId = detail.detail_id ?? detail.id;
            const quantity = detail.quantity ?? 1;
            const unitPrice = detail.price ?? 0;
            const discountPercent = detail.discount_percent ?? 0;

            lines.push({
                key: lineKey([
                    detailType,
                    attention.sale_document_id,
                    detailId,
                ]),
                type: detailType,
                sourceId: detailId,
                attentionId: attention.id,
                saleDocumentId: attention.sale_document_id,
                patientName: detail.patient_name ?? attention.patient.name,
                description: detail.name,
                notes: detail.notes ?? '',
                quantity,
                unitPrice,
                discountPercent,
                detailTotal:
                    detail.detail_total ??
                    posLineSubtotal(unitPrice, quantity, discountPercent),
                taxTreatment: detail.tax_treatment,
            });
        }
    }

    return lines;
}

function resolveTotals(
    payload: PosCustomerAttentionsPayload,
): PosTotalsBreakdown {
    if (payload.totals) {
        return payload.totals;
    }

    const totalAmount =
        payload.total_amount ??
        payload.attentions.reduce(
            (sum, attention) => sum + attention.total_amount,
            0,
        );

    return {
        ...EMPTY_POS_TOTALS,
        global_discount_percent: payload.global_discount_percent ?? 0,
        total_amount: totalAmount,
    };
}

export function usePosCart() {
    const [customer, setCustomer] = useState<PosCustomerDetail | null>(null);
    const [attentions, setAttentions] = useState<PosDraftAttention[]>([]);
    const [lines, setLines] = useState<PosCartLine[]>([]);
    const [globalDiscountPercent, setGlobalDiscountPercent] = useState(0);
    const [totals, setTotals] = useState<PosTotalsBreakdown>(EMPTY_POS_TOTALS);

    const loadCustomerAttentions = useCallback(
        (payload: PosCustomerAttentionsPayload) => {
            const nextTotals = resolveTotals(payload);

            setCustomer(payload.customer);
            setAttentions(payload.attentions);
            setLines(detailsToLines(payload.attentions));
            setGlobalDiscountPercent(
                nextTotals.global_discount_percent ||
                    payload.global_discount_percent ||
                    0,
            );
            setTotals(nextTotals);
        },
        [],
    );

    const clearCustomer = useCallback(() => {
        setCustomer(null);
        setAttentions([]);
        setLines([]);
        setGlobalDiscountPercent(0);
        setTotals(EMPTY_POS_TOTALS);
    }, []);

    const reset = useCallback(() => {
        clearCustomer();
    }, [clearCustomer]);

    const patchLine = useCallback(
        (
            key: string,
            patch: Partial<
                Pick<PosCartLine, 'quantity' | 'discountPercent' | 'notes'>
            >,
        ) => {
            setLines((previous) =>
                previous.map((line) => {
                    if (line.key !== key) {
                        return line;
                    }

                    const next = { ...line, ...patch };
                    next.detailTotal = posLineSubtotal(
                        next.unitPrice,
                        next.quantity,
                        next.discountPercent,
                    );

                    return next;
                }),
            );
        },
        [],
    );

    const setGlobalDiscount = useCallback((percent: number) => {
        const next = Number.isFinite(percent)
            ? Math.min(100, Math.max(0, percent))
            : 0;

        setGlobalDiscountPercent(next);
        setTotals((previous) => ({
            ...previous,
            global_discount_percent: next,
        }));
    }, []);

    const draftSaleDocumentIds = useMemo(
        () => attentions.map((attention) => attention.sale_document_id),
        [attentions],
    );

    return {
        customer,
        attentions,
        lines,
        total: totals.total_amount,
        totals,
        globalDiscountPercent,
        draftSaleDocumentIds,
        loadCustomerAttentions,
        patchLine,
        setGlobalDiscount,
        clearCustomer,
        reset,
    };
}
