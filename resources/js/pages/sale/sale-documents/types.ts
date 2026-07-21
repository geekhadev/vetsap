import type { TabledataListStandardDraft } from '@/components/custom/tabledata';
import type { PaginatedListFilters } from '@/types/list-filters';

export type SaleDocumentStatus = 'draft' | 'issued' | 'paid' | 'voided' | 'merged';

export type SaleDocumentCustomerRef = {
    id: string;
    name: string;
};

export type SaleDocumentOfficeRef = {
    id: string;
    name: string;
};

export type SaleDocumentSiiTypeRef = {
    id: string;
    code: string;
    name: string;
    abbreviation: string;
};

export type SaleDocument = {
    id: string;
    company_id: string;
    status: SaleDocumentStatus;
    document_number: string | null;
    issued_at: string | null;
    customer_name: string;
    net_amount: number;
    exempt_amount: number;
    tax_amount: number;
    total_amount: number;
    paid_amount: number;
    customer?: SaleDocumentCustomerRef | null;
    office?: SaleDocumentOfficeRef | null;
    sii_tax_document_type?: SaleDocumentSiiTypeRef | null;
    created_at: string;
    updated_at: string;
};

export type SaleDocumentsIndexCan = {
    create: boolean;
};

export const SALE_DOCUMENTS_INDEX_MODULE_FILTER_KEYS = ['status'] as const;

export type SaleDocumentsIndexModuleFilterKey =
    (typeof SALE_DOCUMENTS_INDEX_MODULE_FILTER_KEYS)[number];

export type SaleDocumentsIndexModuleFilters = {
    [K in SaleDocumentsIndexModuleFilterKey]: string;
};

export type SaleDocumentListFilters = PaginatedListFilters & {
    [K in SaleDocumentsIndexModuleFilterKey]?: string | null;
};

export type SaleDocumentsIndexFiltersDraftFull =
    SaleDocumentsIndexModuleFilters & TabledataListStandardDraft;

export const SALE_DOCUMENT_STATUS_LABEL: Record<SaleDocumentStatus, string> = {
    draft: 'Borrador',
    issued: 'Emitido',
    paid: 'Pagado',
    voided: 'Anulado',
    merged: 'Fusionado',
};
