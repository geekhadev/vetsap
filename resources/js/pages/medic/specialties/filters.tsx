import { IsActiveIndexFilters } from '@/components/custom/is-active-index-filters';
import type { TabledataListPageViewModel } from '@/components/custom/tabledata';
import type { Specialty, SpecialtiesIndexFiltersDraftFull } from './types';

type SpecialtiesIndexFiltersProps = Pick<
    TabledataListPageViewModel<Specialty, SpecialtiesIndexFiltersDraftFull>,
    'filters' | 'setFilter' | 'applyFilters' | 'resetFilters'
>;

export function SpecialtiesIndexFilters({
    filters,
    setFilter,
    applyFilters,
    resetFilters,
}: SpecialtiesIndexFiltersProps) {
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
