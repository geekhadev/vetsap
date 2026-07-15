import { FilterDropdown } from '@/components/custom/filter-dropdown';
import { FilterDropdownFooter } from '@/components/custom/filter-dropdown-footer';
import { FilterRowWithClear } from '@/components/custom/filter-row-with-clear';
import { FormSelect } from '@/components/custom/form-select';
import { IsActiveFilterRow } from '@/components/custom/is-active-filter-row';
import type { TabledataListPageViewModel } from '@/components/custom/tabledata';
import type {
    MovementCategory,
    MovementCategoriesIndexFiltersDraftFull,
    MovementTypeOption,
} from './types';

type MovementCategoriesIndexFiltersProps = Pick<
    TabledataListPageViewModel<MovementCategory, MovementCategoriesIndexFiltersDraftFull>,
    'filters' | 'setFilter' | 'applyFilters' | 'resetFilters'
> & {
    movementTypes: MovementTypeOption[];
};

export function MovementCategoriesIndexFilters({
    filters,
    setFilter,
    applyFilters,
    resetFilters,
    movementTypes,
}: MovementCategoriesIndexFiltersProps) {
    const typeOptions = movementTypes.map((type) => ({
        id: type.value,
        label: type.label,
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
                canClear={filters.type.trim() !== ''}
                onClear={() => setFilter('type', '')}
                clearLabel="Limpiar filtro de tipo"
            >
                <FormSelect
                    label="Tipo de movimiento"
                    placeholder="Todos"
                    options={typeOptions}
                    selectProps={{
                        id: 'filter-movement-category-type',
                        name: 'type',
                        value: filters.type,
                        onChange: (e) => setFilter('type', e.target.value),
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
