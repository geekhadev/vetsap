import { FilterDropdown } from '@/components/custom/filter-dropdown';
import { FilterDropdownFooter } from '@/components/custom/filter-dropdown-footer';
import { FilterRowWithClear } from '@/components/custom/filter-row-with-clear';
import { FormSelect } from '@/components/custom/form-select';
import type { TabledataListPageViewModel } from '@/components/custom/tabledata';
import { formatExpenseTypeLabel } from './types';
import type {
    Expense,
    ExpensesIndexFiltersDraftFull,
    ExpenseTypeOption,
} from './types';

type ExpensesIndexFiltersProps = Pick<
    TabledataListPageViewModel<Expense, ExpensesIndexFiltersDraftFull>,
    'filters' | 'setFilter' | 'applyFilters' | 'resetFilters'
> & {
    expenseTypes: ExpenseTypeOption[];
};

export function ExpensesIndexFilters({
    filters,
    setFilter,
    applyFilters,
    resetFilters,
    expenseTypes,
}: ExpensesIndexFiltersProps) {
    const options = expenseTypes.map((type) => ({
        id: type.id,
        label: formatExpenseTypeLabel(type),
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
                canClear={filters.expense_type_id.trim() !== ''}
                onClear={() => setFilter('expense_type_id', '')}
                clearLabel="Limpiar filtro de tipo de gasto"
            >
                <FormSelect
                    label="Tipo de gasto"
                    placeholder="Todos"
                    options={options}
                    selectProps={{
                        id: 'filter-expense_type_id',
                        name: 'expense_type_id',
                        value: filters.expense_type_id,
                        onChange: (e) => setFilter('expense_type_id', e.target.value),
                    }}
                />
            </FilterRowWithClear>
        </FilterDropdown>
    );
}
