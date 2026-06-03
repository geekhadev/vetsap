import { buildTabledataListInertiaForModuleStringKeys } from '@/components/custom/tabledata';
import type { TabledataListQueryValues } from '@/components/custom/tabledata';
import type {
    Specialty,
    SpecialtyListFilters,
    SpecialtiesIndexCan,
    SpecialtiesIndexFiltersDraftFull,
} from '@/pages/medic/specialties/types';
import { SPECIALTIES_INDEX_MODULE_FILTER_KEYS } from '@/pages/medic/specialties/types';
import { dashboard } from '@/routes';
import { index as specialtiesIndex } from '@/routes/medic/specialties';
import type { BreadcrumbItem } from '@/types/navigation';
import type { Paginated } from '@/types/pagination';

export type SpecialtiesIndexPageProps = {
    data: Paginated<Specialty>;
    filters: SpecialtiesIndexFiltersDraftFull;
    can: SpecialtiesIndexCan;
};

const PAGE = {
    storageKey: 'specialties-index',
    title: 'Especialidades',
    description: 'Catálogo de especialidades médicas de la empresa activa.',
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
            { title: PAGE.title, href: specialtiesIndex() },
        ],
    },
    listInertia: buildTabledataListInertiaForModuleStringKeys<
        Specialty,
        SpecialtyListFilters,
        typeof SPECIALTIES_INDEX_MODULE_FILTER_KEYS
    >({
        moduleKeys: SPECIALTIES_INDEX_MODULE_FILTER_KEYS,
        indexUrl: (query: TabledataListQueryValues) => specialtiesIndex.url({ query }),
        moduleResetQuery: { ...ORDER },
    }),
};
