import { IsActiveIndexFilters } from '@/components/custom/is-active-index-filters';
import type { TabledataListPageViewModel } from '@/components/custom/tabledata';
import type {
    ProductCategory,
    ProductCategoriesIndexFiltersDraftFull,
} from './types';

type ProductCategoriesIndexFiltersProps = Pick<
    TabledataListPageViewModel<ProductCategory, ProductCategoriesIndexFiltersDraftFull>,
    'filters' | 'setFilter' | 'applyFilters' | 'resetFilters'
>;

export function ProductCategoriesIndexFilters({
    filters,
    setFilter,
    applyFilters,
    resetFilters,
}: ProductCategoriesIndexFiltersProps) {
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
