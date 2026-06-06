import { FilterDropdown } from '@/components/custom/filter-dropdown';
import { FilterDropdownFooter } from '@/components/custom/filter-dropdown-footer';
import { FilterRowWithClear } from '@/components/custom/filter-row-with-clear';
import { FormSelect } from '@/components/custom/form-select';
import { IsActiveFilterRow } from '@/components/custom/is-active-filter-row';
import type { TabledataListPageViewModel } from '@/components/custom/tabledata';
import type { Service, ServicesIndexFiltersDraftFull, SpecialtyOption } from './types';

type ServicesIndexFiltersProps = Pick<
    TabledataListPageViewModel<Service, ServicesIndexFiltersDraftFull>,
    'filters' | 'setFilter' | 'applyFilters' | 'resetFilters'
> & {
    specialties: SpecialtyOption[];
};

export function ServicesIndexFilters({
    filters,
    setFilter,
    applyFilters,
    resetFilters,
    specialties,
}: ServicesIndexFiltersProps) {
    const specialtyOptions = specialties.map((s) => ({
        id: s.id,
        label: s.name,
    }));

    return (
        <FilterDropdown
            footer={
                <FilterDropdownFooter
                    onApply={applyFilters}
                    onReset={resetFilters}
                />
            }
        >
            <FilterRowWithClear
                canClear={filters.specialty_id.trim() !== ''}
                onClear={() => setFilter('specialty_id', '')}
                clearLabel="Limpiar filtro de especialidad"
            >
                <FormSelect
                    label="Especialidad"
                    placeholder="Todas"
                    options={specialtyOptions}
                    selectProps={{
                        id: 'filter-specialty_id',
                        name: 'specialty_id',
                        value: filters.specialty_id,
                        onChange: (e) => setFilter('specialty_id', e.target.value),
                    }}
                />
            </FilterRowWithClear>

            <IsActiveFilterRow
                value={filters.is_active}
                onChange={(value) => setFilter('is_active', value)}
                onClear={() => setFilter('is_active', '')}
                gender="m"
            />
        </FilterDropdown>
    );
}
