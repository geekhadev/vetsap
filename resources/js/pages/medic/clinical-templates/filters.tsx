import { FilterDropdown } from '@/components/custom/filter-dropdown';
import { FilterDropdownFooter } from '@/components/custom/filter-dropdown-footer';
import { FilterRowWithClear } from '@/components/custom/filter-row-with-clear';
import { FormSelect } from '@/components/custom/form-select';
import { IsActiveFilterRow } from '@/components/custom/is-active-filter-row';
import type { TabledataListPageViewModel } from '@/components/custom/tabledata';
import type {
    ClinicalTemplate,
    ClinicalTemplatesIndexFiltersDraftFull,
    SpeciesOption,
} from './types';

type ClinicalTemplatesIndexFiltersProps = Pick<
    TabledataListPageViewModel<ClinicalTemplate, ClinicalTemplatesIndexFiltersDraftFull>,
    'filters' | 'setFilter' | 'applyFilters' | 'resetFilters'
> & {
    species: SpeciesOption[];
};

export function ClinicalTemplatesIndexFilters({
    filters,
    setFilter,
    applyFilters,
    resetFilters,
    species,
}: ClinicalTemplatesIndexFiltersProps) {
    const speciesOptions = species.map((item) => ({ id: item.id, label: item.name }));

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
                        id: 'clinical-templates-filter-species_id',
                        name: 'species_id',
                        value: filters.species_id,
                        onChange: (event) => setFilter('species_id', event.target.value),
                    }}
                />
            </FilterRowWithClear>

            <IsActiveFilterRow
                value={filters.is_active}
                onChange={(value) => setFilter('is_active', value)}
                onClear={() => setFilter('is_active', '')}
                gender="f"
            />
        </FilterDropdown>
    );
}
