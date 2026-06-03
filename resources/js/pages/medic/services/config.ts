import { buildTabledataListInertiaForModuleStringKeys } from '@/components/custom/tabledata';
import type { TabledataListQueryValues } from '@/components/custom/tabledata';
import { SERVICES_INDEX_MODULE_FILTER_KEYS } from '@/pages/medic/services/types';
import type {
    Service,
    ServiceListFilters,
    ServicesIndexCan,
    ServicesIndexFiltersDraftFull,
} from '@/pages/medic/services/types';
import type { SpecialtyOption } from '@/pages/medic/services/types';
import { dashboard } from '@/routes';
import { index as servicesIndex } from '@/routes/medic/services';
import type { BreadcrumbItem } from '@/types/navigation';
import type { Paginated } from '@/types/pagination';

export type ServicesIndexPageProps = {
    data: Paginated<Service>;
    filters: ServicesIndexFiltersDraftFull;
    specialties: SpecialtyOption[];
    can: ServicesIndexCan;
};

const PAGE = {
    storageKey: 'services-index',
    title: 'Servicios',
    description: 'Catálogo de servicios veterinarios de la empresa activa.',
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
            { title: PAGE.title, href: servicesIndex() },
        ],
    },
    listInertia: buildTabledataListInertiaForModuleStringKeys<
        Service,
        ServiceListFilters,
        typeof SERVICES_INDEX_MODULE_FILTER_KEYS
    >({
        moduleKeys: SERVICES_INDEX_MODULE_FILTER_KEYS,
        indexUrl: (query: TabledataListQueryValues) => servicesIndex.url({ query }),
        moduleResetQuery: { ...ORDER },
    }),
};
