import type { TabledataListStandardDraft } from '@/components/custom/tabledata';
import type { PaginatedListFilters } from '@/types/list-filters';

export type ReceivedPaymentUserRef = {
    id: string;
    name: string;
};

export type ReceivedPaymentMethodRef = {
    id: string;
    name: string;
    code: string;
};

export type ReceivedPaymentCashRegisterRef = {
    id: string;
    opened_at: string;
};

export type ReceivedPaymentSiiTaxDocumentTypeRef = {
    id: string;
    name: string;
    abbreviation: string | null;
    code: string;
};

export type ReceivedPaymentSaleDocumentRef = {
    id: string;
    company_id: string;
    customer_id: string | null;
    customer_name: string | null;
    customer_document_number: string | null;
    document_number: string | null;
    sii_tax_document_type_id: string | null;
    status: string;
    total_amount: number;
    sii_tax_document_type?: ReceivedPaymentSiiTaxDocumentTypeRef | null;
};

export type ReceivedPayment = {
    id: string;
    sale_document_id: string;
    cash_register_id: string;
    payment_method_id: string;
    amount: number;
    paid_at: string;
    created_by_user_id: string | null;
    notes: string | null;
    sale_document?: ReceivedPaymentSaleDocumentRef | null;
    payment_method?: ReceivedPaymentMethodRef | null;
    cash_register?: ReceivedPaymentCashRegisterRef | null;
    created_by?: ReceivedPaymentUserRef | null;
    created_at: string;
    updated_at: string;
};

export type PaymentMethodOption = {
    id: string;
    name: string;
    code: string;
};

export const RECEIVED_PAYMENTS_INDEX_MODULE_FILTER_KEYS = [
    'payment_method_id',
] as const;

export type ReceivedPaymentsIndexModuleFilterKey =
    (typeof RECEIVED_PAYMENTS_INDEX_MODULE_FILTER_KEYS)[number];

export type ReceivedPaymentsIndexModuleFilters = {
    [K in ReceivedPaymentsIndexModuleFilterKey]: string;
};

export type ReceivedPaymentListFilters = PaginatedListFilters & {
    [K in ReceivedPaymentsIndexModuleFilterKey]?: string | null;
};

export type ReceivedPaymentsIndexFiltersDraftFull =
    ReceivedPaymentsIndexModuleFilters & TabledataListStandardDraft;
