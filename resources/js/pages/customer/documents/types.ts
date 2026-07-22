import type {
    SaleDocumentPaymentStatus,
    SaleDocumentStatus,
} from '@/pages/sale/sale-documents/types';

export type CustomerSaleDocument = {
    id: string;
    status: Extract<SaleDocumentStatus, 'issued' | 'voided'>;
    payment_status: SaleDocumentPaymentStatus;
    document_number: string | null;
    issued_at: string | null;
    total_amount: number;
    paid_amount: number;
    sii_tax_document_type: {
        id: string;
        code: string;
        name: string;
        abbreviation: string;
    } | null;
    created_at: string | null;
};

export type CustomerDocumentsIndexPageProps = {
    documents: CustomerSaleDocument[];
};
