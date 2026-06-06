import { FilterDropdown } from '@/components/custom/filter-dropdown';
import { FilterDropdownFooter } from '@/components/custom/filter-dropdown-footer';
import { IsActiveFilterRow } from '@/components/custom/is-active-filter-row';
import type { ActiveRecordGender } from '@/types/active-record';

export type IsActiveIndexFiltersProps = {
    isActive: string;
    onIsActiveChange: (value: string) => void;
    onIsActiveClear: () => void;
    applyFilters: () => void;
    resetFilters: () => void;
    gender?: ActiveRecordGender;
};

export function IsActiveIndexFilters({
    isActive,
    onIsActiveChange,
    onIsActiveClear,
    applyFilters,
    resetFilters,
    gender = 'm',
}: IsActiveIndexFiltersProps) {
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
                value={isActive}
                onChange={onIsActiveChange}
                onClear={onIsActiveClear}
                gender={gender}
            />
        </FilterDropdown>
    );
}
