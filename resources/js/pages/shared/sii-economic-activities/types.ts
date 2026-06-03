import type { TabledataListStandardDraft } from '@/components/custom/tabledata';
import type { PaginatedListFilters } from '@/types/list-filters';

export type SiiEconomicActivity = {
    id: number;
    code: string;
    description: string;
    use_iva: boolean;
    tax_category: string;
    use_internet: boolean;
    created_at: string;
    updated_at: string;
};

export const SII_ECONOMIC_ACTIVITIES_INDEX_MODULE_FILTER_KEYS = [] as const;

export type SiiEconomicActivityListFilters = PaginatedListFilters;

export type SiiEconomicActivitiesIndexFiltersDraftFull = TabledataListStandardDraft;
