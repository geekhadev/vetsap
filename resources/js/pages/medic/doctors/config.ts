import { buildTabledataListInertiaForModuleStringKeys } from '@/components/custom/tabledata';
import type { TabledataListQueryValues } from '@/components/custom/tabledata';
import { buildModuleBreadcrumbs } from '@/lib/module-breadcrumbs';
import { DOCTORS_INDEX_MODULE_FILTER_KEYS } from '@/pages/medic/doctors/types';
import type {
    Doctor,
    DoctorListFilters,
    DoctorsIndexCan,
    DoctorsIndexFiltersDraftFull,
    ServiceOption,
} from '@/pages/medic/doctors/types';
import { index as doctorsIndex } from '@/routes/medic/doctors';
import type { BreadcrumbItem } from '@/types/navigation';
import type { Paginated } from '@/types/pagination';

export type DoctorsIndexPageProps = {
    data: Paginated<Doctor>;
    filters: DoctorsIndexFiltersDraftFull;
    services: ServiceOption[];
    calendar_time_block_minutes: number;
    can: DoctorsIndexCan;
};

const PAGE = {
    storageKey: 'doctors-index',
    title: 'Doctores',
    description:
        'Veterinarios y profesionales de la clínica. Asigna servicios y controla su visibilidad en la web.',
    searchPlaceholder:
        'Buscar por nombre, documento, teléfono o email…',
} as const;

const ORDER = { sort: 'first_name', direction: 'asc' } as const;

export const CONFIG_TABLEDATA = {
    storageKey: PAGE.storageKey,
    pageTitle: PAGE.title,
    pageDescription: PAGE.description,
    searchPlaceholder: PAGE.searchPlaceholder,
    order: ORDER,
    breadcrumbs: {
        index: (): BreadcrumbItem[] => buildModuleBreadcrumbs(PAGE.title, doctorsIndex()),
    },
    listInertia: buildTabledataListInertiaForModuleStringKeys<
        Doctor,
        DoctorListFilters,
        typeof DOCTORS_INDEX_MODULE_FILTER_KEYS
    >({
        moduleKeys: DOCTORS_INDEX_MODULE_FILTER_KEYS,
        indexUrl: (query: TabledataListQueryValues) => doctorsIndex.url({ query }),
        moduleResetQuery: { ...ORDER },
    }),
};
