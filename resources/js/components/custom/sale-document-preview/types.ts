export type SaleDocumentPreviewStatus =
    | 'draft'
    | 'issued'
    | 'paid'
    | 'voided'
    | 'merged';

export type SaleDocumentPreviewSiiType = {
    id: string;
    code: string;
    name: string;
    abbreviation: string;
};

export type SaleDocumentPreviewReceptor = {
    name: string;
    document_type: string | null;
    document_number: string | null;
    address: string | null;
    email: string | null;
    phone: string | null;
};

export type SaleDocumentPreviewEmisor = {
    name: string;
    document_number: string | null;
    address: string | null;
    city: string | null;
    giro: string | null;
    acteco: string | null;
    acteco_description: string | null;
    resolution_number: string | null;
    resolution_date: string | null;
};

export type SaleDocumentPreviewDetail = {
    description: string;
    quantity: number;
    unit_price: number;
    discount_percent: number;
    tax_treatment: 'taxable' | 'exempt';
    detail_total: number;
};

export type SaleDocumentPreviewPayment = {
    method_name: string;
    amount: number;
};

export type SaleDocumentPreview = {
    id: string;
    status: SaleDocumentPreviewStatus;
    document_number: string | null;
    issued_at: string | null;
    tax_percent: number;
    tax_amount: number;
    net_amount: number;
    exempt_amount: number;
    global_discount_percent: number;
    global_discount_amount: number;
    total_amount: number;
    paid_amount: number;
    notes: string | null;
    sii_tax_document_type: SaleDocumentPreviewSiiType | null;
    is_boleta: boolean;
    receptor: SaleDocumentPreviewReceptor;
    emisor: SaleDocumentPreviewEmisor;
    details: SaleDocumentPreviewDetail[];
    payments: SaleDocumentPreviewPayment[];
    can: {
        delete: boolean;
    };
};

export type SaleDocumentPreviewDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    saleDocumentId: string | null;
    onDeleted?: (saleDocumentId: string) => void;
};
