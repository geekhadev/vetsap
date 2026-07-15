import { buildTabledataListInertiaForModuleStringKeys } from '@/components/custom/tabledata';
import type { TabledataListQueryValues } from '@/components/custom/tabledata';
import { buildModuleBreadcrumbs } from '@/lib/module-breadcrumbs';
import type {
    AppointmentStatus,
    AppointmentStatusesListFilters,
    AppointmentStatusesIndexCan,
    AppointmentStatusesIndexFiltersDraftFull,
} from '@/pages/agenda/appointment-statuses/types';
import { APPOINTMENT_STATUSES_INDEX_MODULE_FILTER_KEYS } from '@/pages/agenda/appointment-statuses/types';
import { index as appointmentStatusesIndex } from '@/routes/agenda/appointment-statuses';
import type { BreadcrumbItem } from '@/types/navigation';
import type { Paginated } from '@/types/pagination';

export type AppointmentStatusesIndexPageProps = {
    data: Paginated<AppointmentStatus>;
    filters: AppointmentStatusesIndexFiltersDraftFull;
    can: AppointmentStatusesIndexCan;
};

const PAGE = {
    storageKey: 'appointment-statuses-index',
    title: 'Estados de cita',
    description: 'Catálogo de estados para clasificar las citas de la agenda.',
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
        index: (): BreadcrumbItem[] => buildModuleBreadcrumbs(PAGE.title, appointmentStatusesIndex()),
    },
    listInertia: buildTabledataListInertiaForModuleStringKeys<
        AppointmentStatus,
        AppointmentStatusesListFilters,
        typeof APPOINTMENT_STATUSES_INDEX_MODULE_FILTER_KEYS
    >({
        moduleKeys: APPOINTMENT_STATUSES_INDEX_MODULE_FILTER_KEYS,
        indexUrl: (query: TabledataListQueryValues) =>
            appointmentStatusesIndex.url({ query }),
        moduleResetQuery: { ...ORDER },
    }),
};
