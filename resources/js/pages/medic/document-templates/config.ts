import { buildTabledataListInertiaForModuleStringKeys } from '@/components/custom/tabledata';
import type { TabledataListQueryValues } from '@/components/custom/tabledata';
import { buildModuleBreadcrumbs } from '@/lib/module-breadcrumbs';
import type {
    DocumentTemplate,
    DocumentTemplateListFilters,
    DocumentTemplatesIndexCan,
    DocumentTemplatesIndexFiltersDraftFull,
    DocumentTemplateVariableGroup,
} from '@/pages/medic/document-templates/types';
import { DOCUMENT_TEMPLATES_INDEX_MODULE_FILTER_KEYS } from '@/pages/medic/document-templates/types';
import { index as documentTemplatesIndex } from '@/routes/medic/document-templates';
import type { BreadcrumbItem } from '@/types/navigation';
import type { Paginated } from '@/types/pagination';

export type DocumentTemplatesIndexPageProps = {
    data: Paginated<DocumentTemplate>;
    filters: DocumentTemplatesIndexFiltersDraftFull;
    variables: DocumentTemplateVariableGroup[];
    can: DocumentTemplatesIndexCan;
};

const PAGE = {
    storageKey: 'medic-document-templates-index',
    title: 'Plantillas y formatos',
    description: 'Plantillas de documentos médicos con variables dinámicas.',
    searchPlaceholder: 'Buscar por título…',
} as const;

const ORDER = { sort: 'title', direction: 'asc' } as const;

export const CONFIG_TABLEDATA = {
    storageKey: PAGE.storageKey,
    pageTitle: PAGE.title,
    pageDescription: PAGE.description,
    searchPlaceholder: PAGE.searchPlaceholder,
    order: ORDER,
    breadcrumbs: {
        index: (): BreadcrumbItem[] =>
            buildModuleBreadcrumbs(PAGE.title, documentTemplatesIndex()),
    },
    listInertia: buildTabledataListInertiaForModuleStringKeys<
        DocumentTemplate,
        DocumentTemplateListFilters,
        typeof DOCUMENT_TEMPLATES_INDEX_MODULE_FILTER_KEYS
    >({
        moduleKeys: DOCUMENT_TEMPLATES_INDEX_MODULE_FILTER_KEYS,
        indexUrl: (query: TabledataListQueryValues) =>
            documentTemplatesIndex.url({ query }),
        moduleResetQuery: { ...ORDER },
    }),
};
