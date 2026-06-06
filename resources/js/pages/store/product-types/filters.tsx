import { IsActiveIndexFilters } from '@/components/custom/is-active-index-filters';
import type { TabledataListPageViewModel } from '@/components/custom/tabledata';
import type { ProductType, ProductTypesIndexFiltersDraftFull } from './types';

type ProductTypesIndexFiltersProps = Pick<
    TabledataListPageViewModel<ProductType, ProductTypesIndexFiltersDraftFull>,
    'filters' | 'setFilter' | 'applyFilters' | 'resetFilters'
>;

export function ProductTypesIndexFilters({
    filters,
    setFilter,
    applyFilters,
    resetFilters,
}: ProductTypesIndexFiltersProps) {
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
