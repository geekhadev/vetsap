import type { TabledataListStandardDraft } from '@/components/custom/tabledata';
import type { PaginatedListFilters } from '@/types/list-filters';

export type SiiTaxDocumentType = {
    id: string;
    code: string;
    name: string;
    abbreviation: string;
    use_sale: boolean;
    use_purchase: boolean;
    is_global: boolean;
    created_at: string;
    updated_at: string;
};

export const SII_TAX_DOCUMENT_TYPES_INDEX_MODULE_FILTER_KEYS = ['usage'] as const;

export type SiiTaxDocumentTypesIndexModuleFilterKey =
    (typeof SII_TAX_DOCUMENT_TYPES_INDEX_MODULE_FILTER_KEYS)[number];

export type SiiTaxDocumentTypesIndexModuleFilters = {
    [K in SiiTaxDocumentTypesIndexModuleFilterKey]: string;
};

export type SiiTaxDocumentTypeListFilters = PaginatedListFilters & {
    [K in SiiTaxDocumentTypesIndexModuleFilterKey]?: string | null;
};

export type SiiTaxDocumentTypesIndexFiltersDraftFull =
    SiiTaxDocumentTypesIndexModuleFilters & TabledataListStandardDraft;
