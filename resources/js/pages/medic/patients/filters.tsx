import { FilterDropdown } from '@/components/custom/filter-dropdown';
import { FilterDropdownFooter } from '@/components/custom/filter-dropdown-footer';
import { FilterRowWithClear } from '@/components/custom/filter-row-with-clear';
import { FormSelect } from '@/components/custom/form-select';
import { IsActiveFilterRow } from '@/components/custom/is-active-filter-row';
import type { TabledataListPageViewModel } from '@/components/custom/tabledata';
import type {
    CustomerOption,
    Patient,
    PatientsIndexFiltersDraftFull,
    SpeciesOption,
} from './types';

type PatientsIndexFiltersProps = Pick<
    TabledataListPageViewModel<Patient, PatientsIndexFiltersDraftFull>,
    'filters' | 'setFilter' | 'applyFilters' | 'resetFilters'
> & {
    species: SpeciesOption[];
    customers: CustomerOption[];
};

export function PatientsIndexFilters({
    filters,
    setFilter,
    applyFilters,
    resetFilters,
    species,
    customers,
}: PatientsIndexFiltersProps) {
    const speciesOptions = species.map((item) => ({ id: item.id, label: item.name }));
    const customerOptions = customers.map((item) => ({
        id: item.id,
        label: `${item.name} (${item.document_number})`,
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
                canClear={filters.species_id.trim() !== ''}
                onClear={() => setFilter('species_id', '')}
                clearLabel="Limpiar filtro de especie"
            >
                <FormSelect
                    label="Especie"
                    placeholder="Todas"
                    options={speciesOptions}
                    selectProps={{
                        id: 'patients-filter-species_id',
                        name: 'species_id',
                        value: filters.species_id,
                        onChange: (event) => setFilter('species_id', event.target.value),
                    }}
                />
            </FilterRowWithClear>

            <FilterRowWithClear
                canClear={filters.customer_id.trim() !== ''}
                onClear={() => setFilter('customer_id', '')}
                clearLabel="Limpiar filtro de cliente"
            >
                <FormSelect
                    label="Cliente"
                    placeholder="Todos"
                    options={customerOptions}
                    selectProps={{
                        id: 'patients-filter-customer_id',
                        name: 'customer_id',
                        value: filters.customer_id,
                        onChange: (event) => setFilter('customer_id', event.target.value),
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
