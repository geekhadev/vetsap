import { IsActiveIndexFilters } from '@/components/custom/is-active-index-filters';
import type { TabledataListPageViewModel } from '@/components/custom/tabledata';
import type { Holiday, HolidaysIndexFiltersDraftFull } from './types';

type HolidaysIndexFiltersProps = Pick<
    TabledataListPageViewModel<Holiday, HolidaysIndexFiltersDraftFull>,
    'filters' | 'setFilter' | 'applyFilters' | 'resetFilters'
>;

export function HolidaysIndexFilters({
    filters,
    setFilter,
    applyFilters,
    resetFilters,
}: HolidaysIndexFiltersProps) {
    return (
        <IsActiveIndexFilters
            isActive={filters.is_active}
            onIsActiveChange={(value) => setFilter('is_active', value)}
            onIsActiveClear={() => setFilter('is_active', '')}
            applyFilters={applyFilters}
            resetFilters={resetFilters}
            gender="m"
        />
    );
}
