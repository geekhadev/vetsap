export type PosCustomerSearchResult = {
    id: string;
    name: string;
    document_type: string | null;
    document_number: string | null;
    phone: string | null;
    open_sales_count: number;
};

export type PosAttentionService = {
    id: string;
    detail_id?: string;
    product_id?: string | null;
    service_id?: string | null;
    name: string;
    notes?: string | null;
    price: number | null;
    tax_treatment: 'taxable' | 'exempt';
    detail_type?: 'service' | 'product' | 'custom';
    quantity?: number;
    discount_percent?: number;
    detail_total?: number;
    patient_name?: string | null;
};

export type PosDraftAttention = {
    id: string;
    sale_document_id: string;
    started_at: string | null;
    patient: { id: string; name: string };
    template_name: string | null;
    services: PosAttentionService[];
    total_amount: number;
};

export type PosCustomerDetail = {
    id: string;
    name: string;
    document_type: string | null;
    document_number: string | null;
    phone: string | null;
};

export type PosTotalsBreakdown = {
    exempt_amount: number;
    net_amount: number;
    details_discount_amount: number;
    global_discount_amount: number;
    global_discount_percent: number;
    tax_amount: number;
    total_amount: number;
};

export type PosCustomerAttentionsPayload = {
    customer: PosCustomerDetail;
    attentions: PosDraftAttention[];
    global_discount_percent?: number;
    total_amount?: number;
    totals?: PosTotalsBreakdown;
};

export const EMPTY_POS_TOTALS: PosTotalsBreakdown = {
    exempt_amount: 0,
    net_amount: 0,
    details_discount_amount: 0,
    global_discount_amount: 0,
    global_discount_percent: 0,
    tax_amount: 0,
    total_amount: 0,
};

export type PosLineType = 'service' | 'product' | 'custom';

export type PosCartLine = {
    key: string;
    type: PosLineType;
    sourceId: string;
    attentionId?: string;
    saleDocumentId?: string;
    patientName?: string;
    description: string;
    notes: string;
    quantity: number;
    unitPrice: number;
    discountPercent: number;
    detailTotal: number;
    taxTreatment: 'taxable' | 'exempt';
};

export type PosPaymentMethodOption = {
    id: string;
    name: string;
    code: string;
};

export type PosPaymentTypeOption = {
    id: string;
    name: string;
    code: string;
    is_credit: boolean;
};

export type PosSiiTaxDocumentTypeOption = {
    id: string;
    code: string;
    name: string;
    abbreviation: string;
};

export type PosOptionsPayload = {
    payment_methods: PosPaymentMethodOption[];
    payment_types: PosPaymentTypeOption[];
    sii_tax_document_types: PosSiiTaxDocumentTypeOption[];
    tax_percent: number;
    cash_round_to: number;
    cash_round_threshold: number;
};

export type PosDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onRequestCloseCashRegister: () => void;
    onCharged?: (saleDocumentId: string) => void;
    /** Si viene, al abrir el POS carga las ventas abiertas de este cliente. */
    initialCustomerId?: string | null;
};

export function posLineSubtotal(
    unitPrice: number,
    quantity: number,
    discountPercent: number,
): number {
    const gross = unitPrice * quantity;
    const discount = Math.round((gross * Math.min(100, Math.max(0, discountPercent))) / 100);

    return Math.max(0, gross - discount);
}
