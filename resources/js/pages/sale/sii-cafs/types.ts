import type { TabledataListStandardDraft } from '@/components/custom/tabledata';
import type { PaginatedListFilters } from '@/types/list-filters';

export type SiiCafStatusValue = 'active' | 'expired' | 'cancelled';

export type SiiCafFolioStatusValue = 'available' | 'draft' | 'used' | 'expired';

export type SiiCafRow = {
    id: string;
    company_id: string;
    sii_tax_document_type_id: string;
    sii_document_type_code: string;
    folio_from: number;
    folio_to: number;
    authorized_at: string;
    expires_at: string;
    status: SiiCafStatusValue;
    xml_path: string;
    uploaded_at: string;
    created_at: string;
    updated_at: string;
    folios_used_count: number;
    folios_draft_count: number;
    last_used_folio: number | null;
    sii_tax_document_type?: {
        id: string;
        name: string;
        code: string;
    };
};

export type SiiCafDocumentTypeOption = {
    id: string;
    name: string;
    code: string;
};

export const SII_CAFS_INDEX_MODULE_FILTER_KEYS = ['sii_tax_document_type_id'] as const;

export type SiiCafsIndexModuleFilterKey =
    (typeof SII_CAFS_INDEX_MODULE_FILTER_KEYS)[number];

export type SiiCafsIndexModuleFilters = {
    [K in SiiCafsIndexModuleFilterKey]: string;
};

type SiiCafListModuleQuery = {
    [K in SiiCafsIndexModuleFilterKey]?: string | null;
};

/** Incluye `folios_for` en query para cargar el modal de folios sin cambiar de página. */
export type SiiCafListFilters = PaginatedListFilters &
    SiiCafListModuleQuery & {
        folios_for?: string | null;
    };

export type SiiCafsIndexFiltersDraftFull = SiiCafsIndexModuleFilters & TabledataListStandardDraft;

export type SiiCafFolioModalRow = {
    id: string;
    folio_number: number;
    status: SiiCafFolioStatusValue;
    used_at: string | null;
};

export type FoliosForModalPayload = {
    caf: {
        id: string;
        folio_from: number;
        folio_to: number;
        document_type_name: string;
        document_type_code: string;
    };
    folios: SiiCafFolioModalRow[];
    truncated: boolean;
};
