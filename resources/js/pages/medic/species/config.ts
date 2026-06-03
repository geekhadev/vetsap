import { buildTabledataListInertiaForModuleStringKeys } from '@/components/custom/tabledata';
import type { TabledataListQueryValues } from '@/components/custom/tabledata';
import type {
    Species,
    SpeciesListFilters,
    SpeciesIndexCan,
    SpeciesIndexFiltersDraftFull,
} from '@/pages/medic/species/types';
import { SPECIES_INDEX_MODULE_FILTER_KEYS } from '@/pages/medic/species/types';
import { dashboard } from '@/routes';
import { index as speciesIndex } from '@/routes/medic/species';
import type { BreadcrumbItem } from '@/types/navigation';
import type { Paginated } from '@/types/pagination';

export type SpeciesIndexPageProps = {
    data: Paginated<Species>;
    filters: SpeciesIndexFiltersDraftFull;
    can: SpeciesIndexCan;
};

const PAGE = {
    storageKey: 'species-index',
    title: 'Especies',
    description: 'Catálogo de especies animales de la empresa activa.',
    searchPlaceholder: 'Buscar por nombre…',
} as const;

const ORDER = { sort: 'name', direction: 'asc' } as const;

export const CONFIG_TABLEDATA = {
    storageKey: PAGE.storageKey,
    pageTitle: PAGE.title,
    pageDescription: PAGE.description,
    searchPlaceholder: PAGE.searchPlaceholder,
    order: ORDER,
    breadcrumbs: {
        index: (): BreadcrumbItem[] => [
            { title: 'Panel', href: dashboard() },
            { title: PAGE.title, href: speciesIndex() },
        ],
    },
    listInertia: buildTabledataListInertiaForModuleStringKeys<
        Species,
        SpeciesListFilters,
        typeof SPECIES_INDEX_MODULE_FILTER_KEYS
    >({
        moduleKeys: SPECIES_INDEX_MODULE_FILTER_KEYS,
        indexUrl: (query: TabledataListQueryValues) => speciesIndex.url({ query }),
        moduleResetQuery: { ...ORDER },
    }),
};
