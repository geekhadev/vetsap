import { buildTabledataListInertiaForModuleStringKeys } from '@/components/custom/tabledata';
import type { TabledataListQueryValues } from '@/components/custom/tabledata';
import type {
    SiiEconomicActivitiesIndexFiltersDraftFull,
    SiiEconomicActivity,
    SiiEconomicActivityListFilters,
} from '@/pages/shared/sii-economic-activities/types';
import { dashboard } from '@/routes';
import { index as siiEconomicActivitiesIndex } from '@/routes/shared/sii-economic-activities';
import type { BreadcrumbItem } from '@/types/navigation';
import type { Paginated } from '@/types/pagination';
import { SII_ECONOMIC_ACTIVITIES_INDEX_MODULE_FILTER_KEYS } from './types';

export type SiiEconomicActivitiesIndexPageProps = {
    data: Paginated<SiiEconomicActivity>;
    filters: SiiEconomicActivitiesIndexFiltersDraftFull;
};

const PAGE = {
    storageKey: 'sii-economic-activities-index',
    title: 'SII actividades económicas',
    description:
        'Catálogo compartido de códigos y rubros de actividades económicas del Servicio de Impuestos Internos.',
    searchPlaceholder: 'Código, descripción o categoría tributaria…',
} as const;

const ORDER = { sort: 'code', direction: 'asc' } as const;

export const CONFIG_TABLEDATA = {
    storageKey: PAGE.storageKey,
    pageTitle: PAGE.title,
    pageDescription: PAGE.description,
    searchPlaceholder: PAGE.searchPlaceholder,
    order: ORDER,
    breadcrumbs: {
        index: (): BreadcrumbItem[] => [
            { title: 'Panel', href: dashboard() },
            { title: PAGE.title, href: siiEconomicActivitiesIndex() },
        ],
    },
    listInertia: buildTabledataListInertiaForModuleStringKeys<
        SiiEconomicActivity,
        SiiEconomicActivityListFilters,
        typeof SII_ECONOMIC_ACTIVITIES_INDEX_MODULE_FILTER_KEYS
    >({
        moduleKeys: SII_ECONOMIC_ACTIVITIES_INDEX_MODULE_FILTER_KEYS,
        indexUrl: (query: TabledataListQueryValues) =>
            siiEconomicActivitiesIndex.url({ query }),
        moduleResetQuery: { ...ORDER },
    }),
};
