import { buildTabledataListInertiaForModuleStringKeys } from '@/components/custom/tabledata';
import type { TabledataListQueryValues } from '@/components/custom/tabledata';
import { buildModuleBreadcrumbs } from '@/lib/module-breadcrumbs';
import type {
    Holiday,
    HolidaysListFilters,
    HolidaysIndexCan,
    HolidaysIndexFiltersDraftFull,
} from '@/pages/agenda/holidays/types';
import { HOLIDAYS_INDEX_MODULE_FILTER_KEYS } from '@/pages/agenda/holidays/types';
import { index as holidaysIndex } from '@/routes/agenda/holidays';
import type { BreadcrumbItem } from '@/types/navigation';
import type { Paginated } from '@/types/pagination';

export type HolidaysIndexPageProps = {
    data: Paginated<Holiday>;
    filters: HolidaysIndexFiltersDraftFull;
    can: HolidaysIndexCan;
};

const PAGE = {
    storageKey: 'holidays-index',
    title: 'Días feriados',
    description: 'Fechas en las que la clínica no atiende citas.',
    searchPlaceholder: 'Buscar por nombre…',
} as const;

const ORDER = { sort: 'date', direction: 'asc' } as const;

export const CONFIG_TABLEDATA = {
    storageKey: PAGE.storageKey,
    pageTitle: PAGE.title,
    pageDescription: PAGE.description,
    searchPlaceholder: PAGE.searchPlaceholder,
    order: ORDER,
    breadcrumbs: {
        index: (): BreadcrumbItem[] => buildModuleBreadcrumbs(PAGE.title, holidaysIndex()),
    },
    listInertia: buildTabledataListInertiaForModuleStringKeys<
        Holiday,
        HolidaysListFilters,
        typeof HOLIDAYS_INDEX_MODULE_FILTER_KEYS
    >({
        moduleKeys: HOLIDAYS_INDEX_MODULE_FILTER_KEYS,
        indexUrl: (query: TabledataListQueryValues) => holidaysIndex.url({ query }),
        moduleResetQuery: { ...ORDER },
    }),
};
