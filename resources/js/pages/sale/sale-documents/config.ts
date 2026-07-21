import { buildTabledataListInertiaForModuleStringKeys } from '@/components/custom/tabledata';
import type { TabledataListQueryValues } from '@/components/custom/tabledata';
import { buildModuleBreadcrumbs } from '@/lib/module-breadcrumbs';
import type {
    SaleDocument,
    SaleDocumentListFilters,
    SaleDocumentsIndexCan,
    SaleDocumentsIndexFiltersDraftFull,
} from '@/pages/sale/sale-documents/types';
import { SALE_DOCUMENTS_INDEX_MODULE_FILTER_KEYS } from '@/pages/sale/sale-documents/types';
import { index as saleDocumentsIndex } from '@/routes/sale/sale-documents';
import type { BreadcrumbItem } from '@/types/navigation';
import type { Paginated } from '@/types/pagination';

export type SaleDocumentsIndexPageProps = {
    data: Paginated<SaleDocument>;
    filters: SaleDocumentsIndexFiltersDraftFull;
    can: SaleDocumentsIndexCan;
};

const PAGE = {
    storageKey: 'sale-documents-index',
    title: 'Documentos de venta',
    description: 'Borradores y documentos cobrados de la empresa activa.',
    searchPlaceholder: 'Cliente, RUT o folio…',
} as const;

const ORDER = { sort: 'created_at', direction: 'desc' } as const;

export const CONFIG_TABLEDATA = {
    storageKey: PAGE.storageKey,
    pageTitle: PAGE.title,
    pageDescription: PAGE.description,
    searchPlaceholder: PAGE.searchPlaceholder,
    order: ORDER,
    breadcrumbs: {
        index: (): BreadcrumbItem[] =>
            buildModuleBreadcrumbs(PAGE.title, saleDocumentsIndex()),
    },
    listInertia: buildTabledataListInertiaForModuleStringKeys<
        SaleDocument,
        SaleDocumentListFilters,
        typeof SALE_DOCUMENTS_INDEX_MODULE_FILTER_KEYS
    >({
        moduleKeys: SALE_DOCUMENTS_INDEX_MODULE_FILTER_KEYS,
        indexUrl: (query: TabledataListQueryValues) =>
            saleDocumentsIndex.url({ query }),
        moduleResetQuery: { ...ORDER },
    }),
};
