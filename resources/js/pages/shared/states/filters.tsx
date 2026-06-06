import { FilterDropdown } from '@/components/custom/filter-dropdown';
import { FilterDropdownFooter } from '@/components/custom/filter-dropdown-footer';
import { FilterRowWithClear } from '@/components/custom/filter-row-with-clear';
import { FormSelect } from '@/components/custom/form-select';
import type { TabledataListPageViewModel } from '@/components/custom/tabledata';
import type {
    CountryOption,
    State,
    StatesIndexFiltersDraftFull,
} from './types';

type StatesIndexFiltersProps = Pick<
    TabledataListPageViewModel<State, StatesIndexFiltersDraftFull>,
    'filters' | 'setFilter' | 'applyFilters' | 'resetFilters'
> & {
    countries: CountryOption[];
};

export function StatesIndexFilters({
    filters,
    setFilter,
    applyFilters,
    resetFilters,
    countries,
}: StatesIndexFiltersProps) {
    const options = countries.map((country) => ({
        id: country.id,
        label: country.name,
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
                canClear={filters.country_id.trim() !== ''}
                onClear={() => setFilter('country_id', '')}
                clearLabel="Limpiar filtro de pais"
            >
                <FormSelect
                    label="Pais"
                    placeholder=""
                    options={options}
                    selectProps={{
                        id: 'filter-country_id',
                        name: 'country_id',
                        value: filters.country_id,
                        onChange: (e) => setFilter('country_id', e.target.value),
                    }}
                />
            </FilterRowWithClear>
        </FilterDropdown>
    );
}
