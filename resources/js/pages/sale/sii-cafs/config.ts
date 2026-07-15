import { TABLEDATA_LIST_INERTIA_ONLY } from '@/components/custom/tabledata';
import { buildTabledataListInertiaForModuleStringKeys } from '@/components/custom/tabledata';
import type { TabledataListQueryValues } from '@/components/custom/tabledata';
import { buildModuleBreadcrumbs } from '@/lib/module-breadcrumbs';
import type {
    FoliosForModalPayload,
    SiiCafDocumentTypeOption,
    SiiCafListFilters,
    SiiCafRow,
} from '@/pages/sale/sii-cafs/types';
import { SII_CAFS_INDEX_MODULE_FILTER_KEYS } from '@/pages/sale/sii-cafs/types';
import { index as siiCafsIndex } from '@/routes/sale/sii-cafs';
import type { BreadcrumbItem } from '@/types/navigation';
import type { Paginated } from '@/types/pagination';

export type SiiCafsIndexPageProps = {
    sii_ready: boolean;
    data: Paginated<SiiCafRow>;
    filters: SiiCafListFilters;
    document_types: SiiCafDocumentTypeOption[];
    folios_for_modal: FoliosForModalPayload | null;
    can: {
        upload: boolean;
        delete: boolean;
    };
};

const PAGE = {
    storageKey: 'sale-sii-cafs-index',
    title: 'SII CAFs',
    description:
        'Gestiona los códigos de autorización de folios (CAF) descargados del SII para la empresa activa.',
    searchPlaceholder: 'Tipo de documento (nombre o código)…',
} as const;

const ORDER = { sort: 'folio_from', direction: 'desc' } as const;

export const SII_CAFS_INDEX_INERTIA_ONLY = [
    ...TABLEDATA_LIST_INERTIA_ONLY,
    'folios_for_modal',
    'can',
    'sii_ready',
    'document_types',
] as const;

export const CONFIG_TABLEDATA = {
    storageKey: PAGE.storageKey,
    pageTitle: PAGE.title,
    pageDescription: PAGE.description,
    searchPlaceholder: PAGE.searchPlaceholder,
    order: ORDER,
    breadcrumbs: {
        index: (): BreadcrumbItem[] => buildModuleBreadcrumbs(PAGE.title, siiCafsIndex()),
    },
    listInertia: buildTabledataListInertiaForModuleStringKeys<
        SiiCafRow,
        SiiCafListFilters,
        typeof SII_CAFS_INDEX_MODULE_FILTER_KEYS
    >({
        moduleKeys: SII_CAFS_INDEX_MODULE_FILTER_KEYS,
        indexUrl: (query: TabledataListQueryValues) => siiCafsIndex.url({ query }),
        moduleResetQuery: { ...ORDER },
        inertiaOnly: SII_CAFS_INDEX_INERTIA_ONLY,
    }),
};
