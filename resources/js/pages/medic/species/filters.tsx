import { IsActiveIndexFilters } from '@/components/custom/is-active-index-filters';
import type { TabledataListPageViewModel } from '@/components/custom/tabledata';
import type { Species, SpeciesIndexFiltersDraftFull } from './types';

type SpeciesIndexFiltersProps = Pick<
    TabledataListPageViewModel<Species, SpeciesIndexFiltersDraftFull>,
    'filters' | 'setFilter' | 'applyFilters' | 'resetFilters'
>;

export function SpeciesIndexFilters({
    filters,
    setFilter,
    applyFilters,
    resetFilters,
}: SpeciesIndexFiltersProps) {
    return (
        <IsActiveIndexFilters
            isActive={filters.is_active}
            onIsActiveChange={(value) => setFilter('is_active', value)}
            onIsActiveClear={() => setFilter('is_active', '')}
            applyFilters={applyFilters}
            resetFilters={resetFilters}
            gender="f"
        />
    );
}
