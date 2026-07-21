import { FilterDropdown } from '@/components/custom/filter-dropdown';
import { FilterDropdownFooter } from '@/components/custom/filter-dropdown-footer';
import { FilterRowWithClear } from '@/components/custom/filter-row-with-clear';
import { FormSelect } from '@/components/custom/form-select';
import type { TabledataListPageViewModel } from '@/components/custom/tabledata';
import type {
    CashRegister,
    CashRegistersIndexFiltersDraftFull,
} from '@/pages/sale/cash-registers/types';

type CashRegistersIndexFiltersProps = Pick<
    TabledataListPageViewModel<CashRegister, CashRegistersIndexFiltersDraftFull>,
    'filters' | 'setFilter' | 'applyFilters' | 'resetFilters'
>;

export function CashRegistersIndexFilters({
    filters,
    setFilter,
    applyFilters,
    resetFilters,
}: CashRegistersIndexFiltersProps) {
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
                label="Estado"
                hasValue={filters.status !== ''}
                onClear={() => setFilter('status', '')}
            >
                <FormSelect
                    placeholder="Todos"
                    options={[
                        { value: 'open', label: 'Abierta' },
                        { value: 'closed', label: 'Cerrada' },
                    ]}
                    selectProps={{
                        value: filters.status,
                        onChange: (event) =>
                            setFilter('status', event.target.value),
                    }}
                />
            </FilterRowWithClear>
        </FilterDropdown>
    );
}
