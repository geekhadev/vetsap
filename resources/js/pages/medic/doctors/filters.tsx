import { FilterDropdown } from '@/components/custom/filter-dropdown';
import { FilterDropdownFooter } from '@/components/custom/filter-dropdown-footer';
import { IsActiveFilterRow } from '@/components/custom/is-active-filter-row';
import type { TabledataListPageViewModel } from '@/components/custom/tabledata';
import type { Doctor, DoctorsIndexFiltersDraftFull } from './types';

type DoctorsIndexFiltersProps = Pick<
    TabledataListPageViewModel<Doctor, DoctorsIndexFiltersDraftFull>,
    'filters' | 'setFilter' | 'applyFilters' | 'resetFilters'
>;

export function DoctorsIndexFilters({
    filters,
    setFilter,
    applyFilters,
    resetFilters,
}: DoctorsIndexFiltersProps) {
    return (
        <FilterDropdown
            footer={
                <FilterDropdownFooter
                    onApply={applyFilters}
                    onReset={resetFilters}
                />
            }
        >
            <IsActiveFilterRow
                value={filters.is_active}
                onChange={(value) => setFilter('is_active', value)}
                onClear={() => setFilter('is_active', '')}
                gender="m"
            />
        </FilterDropdown>
    );
}
