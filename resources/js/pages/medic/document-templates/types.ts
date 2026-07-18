import type { DocumentTemplateVariableGroup } from '@/components/custom/document-template-editor/types';
import type { TabledataListStandardDraft } from '@/components/custom/tabledata';
import type { PaginatedListFilters } from '@/types/list-filters';

export type DocumentTemplate = {
    id: string;
    company_id: string;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
};

export type DocumentTemplatesIndexCan = {
    create: boolean;
    update: boolean;
    delete: boolean;
};

/** Sin filtros de dominio en el índice; solo serialización / merge estándar de tabledata. */
export const DOCUMENT_TEMPLATES_INDEX_MODULE_FILTER_KEYS = [] as const;

export type DocumentTemplateListFilters = PaginatedListFilters;

export type DocumentTemplatesIndexFiltersDraftFull = TabledataListStandardDraft;

export type { DocumentTemplateVariableGroup };
