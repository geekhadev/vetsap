export type SaleDocumentPaymentDetail = {
    id: string;
    amount: number;
    paid_at: string | null;
    payment_method: {
        id: string;
        name: string;
        code: string;
    } | null;
    created_by: {
        id: string;
        name: string;
    } | null;
};

export type SaleDocumentPaymentsPayload = {
    id: string;
    status: 'draft' | 'issued' | 'voided' | 'merged';
    payment_status: 'pending' | 'partial' | 'paid';
    total_amount: number;
    paid_amount: number;
    balance_amount: number;
    can: {
        charge: boolean;
    };
    payments: SaleDocumentPaymentDetail[];
};

export type SaleDocumentPaymentsDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    saleDocumentId: string | null;
    onRequestCharge?: (saleDocumentId: string) => void;
};
