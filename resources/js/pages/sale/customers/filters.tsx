import { FilterDropdown } from '@/components/custom/filter-dropdown';
import { FilterDropdownFooter } from '@/components/custom/filter-dropdown-footer';
import { FilterRowWithClear } from '@/components/custom/filter-row-with-clear';
import { FormSelect } from '@/components/custom/form-select';
import type { TabledataListPageViewModel } from '@/components/custom/tabledata';
import { DOCUMENT_TYPE_FILTER_OPTIONS } from './types';
import type { Customer, CustomersIndexFiltersDraftFull } from './types';

type CustomersIndexFiltersProps = Pick<
    TabledataListPageViewModel<Customer, CustomersIndexFiltersDraftFull>,
    'filters' | 'setFilter' | 'applyFilters' | 'resetFilters'
>;

export function CustomersIndexFilters({
    filters,
    setFilter,
    applyFilters,
    resetFilters,
}: CustomersIndexFiltersProps) {
    const options = DOCUMENT_TYPE_FILTER_OPTIONS.map((opt) => ({
        id: opt.id,
        label: opt.label,
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
                canClear={filters.document_type.trim() !== ''}
                onClear={() => setFilter('document_type', '')}
                clearLabel="Limpiar filtro de tipo de documento"
            >
                <FormSelect
                    label="Tipo de documento"
                    placeholder=""
                    options={options}
                    selectProps={{
                        id: 'filter-document_type',
                        name: 'document_type',
                        value: filters.document_type,
                        onChange: (e) => setFilter('document_type', e.target.value),
                    }}
                />
            </FilterRowWithClear>
        </FilterDropdown>
    );
}
