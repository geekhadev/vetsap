import { FilterDropdown } from '@/components/custom/filter-dropdown';
import { FilterDropdownFooter } from '@/components/custom/filter-dropdown-footer';
import { FilterRowWithClear } from '@/components/custom/filter-row-with-clear';
import type { FormSelectOption } from '@/components/custom/form-select';
import { FormSelect } from '@/components/custom/form-select';
import type { TabledataListPageViewModel } from '@/components/custom/tabledata';
import type {
    Module,
    ModulesIndexFiltersDraftFull,
    SystemOption,
} from './types';

type ModulesIndexFiltersProps = Pick<
    TabledataListPageViewModel<Module, ModulesIndexFiltersDraftFull>,
    'filters' | 'setFilter' | 'applyFilters' | 'resetFilters'
> & {
    systems: SystemOption[];
};

export function ModulesIndexFilters({
    filters,
    setFilter,
    applyFilters,
    resetFilters,
    systems,
}: ModulesIndexFiltersProps) {
    const systemOptions: FormSelectOption[] = [
        { id: '', label: 'Todos los sistemas' },
        ...systems.map((s) => ({
            id: String(s.id),
            label: s.name,
        })),
    ];

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
                canClear={filters.system_id.trim() !== ''}
                onClear={() => setFilter('system_id', '')}
                clearLabel="Limpiar filtro de sistema"
            >
                <FormSelect
                    label="Sistema"
                    placeholder=""
                    options={systemOptions}
                    selectProps={{
                        id: 'filter-system_id',
                        name: 'system_id',
                        value: filters.system_id,
                        onChange: (e) => setFilter('system_id', e.target.value),
                    }}
                />
            </FilterRowWithClear>
        </FilterDropdown>
    );
}
