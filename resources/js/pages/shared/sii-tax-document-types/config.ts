import { buildTabledataListInertiaForModuleStringKeys } from '@/components/custom/tabledata';
import type { TabledataListQueryValues } from '@/components/custom/tabledata';
import type {
    SiiTaxDocumentType,
    SiiTaxDocumentTypeListFilters,
} from '@/pages/shared/sii-tax-document-types/types';
import { dashboard } from '@/routes';
import { index as siiTaxDocumentTypesIndex } from '@/routes/shared/sii-tax-document-types';
import type { BreadcrumbItem } from '@/types/navigation';
import type { Paginated } from '@/types/pagination';
import { SII_TAX_DOCUMENT_TYPES_INDEX_MODULE_FILTER_KEYS } from './types';

export type SiiTaxDocumentTypesIndexPageProps = {
    data: Paginated<SiiTaxDocumentType>;
    filters: SiiTaxDocumentTypeListFilters;
};

const PAGE = {
    storageKey: 'sii-tax-document-types-index',
    title: 'SII tipos de documento tributario',
    description:
        'Catálogo compartido de códigos de documentos del SII (ventas y compras).',
    searchPlaceholder: 'Código, nombre o abreviatura…',
} as const;

const ORDER = { sort: 'code', direction: 'asc' } as const;

/** Filtro de ámbito: sin valor = todos los registros. */
const USAGE_FILTER_OPTIONS = [
    { id: '', label: 'Todos' },
    { id: 'sale', label: 'Ventas' },
    { id: 'purchase', label: 'Compras' },
] as const;

export const CONFIG_TABLEDATA = {
    storageKey: PAGE.storageKey,
    pageTitle: PAGE.title,
    pageDescription: PAGE.description,
    searchPlaceholder: PAGE.searchPlaceholder,
    order: ORDER,
    USAGE_FILTER_OPTIONS,
    breadcrumbs: {
        index: (): BreadcrumbItem[] => [
            { title: 'Panel', href: dashboard() },
            { title: PAGE.title, href: siiTaxDocumentTypesIndex() },
        ],
    },
    listInertia: buildTabledataListInertiaForModuleStringKeys<
        SiiTaxDocumentType,
        SiiTaxDocumentTypeListFilters,
        typeof SII_TAX_DOCUMENT_TYPES_INDEX_MODULE_FILTER_KEYS
    >({
        moduleKeys: SII_TAX_DOCUMENT_TYPES_INDEX_MODULE_FILTER_KEYS,
        indexUrl: (query: TabledataListQueryValues) =>
            siiTaxDocumentTypesIndex.url({ query }),
        moduleResetQuery: { ...ORDER },
    }),
};
