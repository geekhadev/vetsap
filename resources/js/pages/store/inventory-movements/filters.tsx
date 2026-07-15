import { FilterDropdown } from '@/components/custom/filter-dropdown';
import { FilterDropdownFooter } from '@/components/custom/filter-dropdown-footer';
import { FilterRowWithClear } from '@/components/custom/filter-row-with-clear';
import { FormSelect } from '@/components/custom/form-select';
import type { TabledataListPageViewModel } from '@/components/custom/tabledata';
import type {
    InventoryMovement,
    InventoryMovementsIndexFiltersDraftFull,
    MovementCategoryOption,
    MovementTypeOption,
} from './types';

type InventoryMovementsIndexFiltersProps = Pick<
    TabledataListPageViewModel<
        InventoryMovement,
        InventoryMovementsIndexFiltersDraftFull
    >,
    'filters' | 'setFilter' | 'applyFilters' | 'resetFilters'
> & {
    movementTypes: MovementTypeOption[];
    movementCategories: MovementCategoryOption[];
};

export function InventoryMovementsIndexFilters({
    filters,
    setFilter,
    applyFilters,
    resetFilters,
    movementTypes,
    movementCategories,
}: InventoryMovementsIndexFiltersProps) {
    const typeOptions = movementTypes.map((type) => ({
        id: type.value,
        label: type.label,
    }));

    const categoryOptions = movementCategories
        .filter(
            (category) =>
                filters.type === '' || category.type === filters.type,
        )
        .map((category) => ({
            id: category.id,
            label: category.name,
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
                onClear={() => {
                    setFilter('type', '');
                    setFilter('movement_category_id', '');
                }}
                clearLabel="Limpiar filtro de tipo"
            >
                <FormSelect
                    label="Tipo"
                    placeholder="Todos"
                    options={typeOptions}
                    selectProps={{
                        id: 'filter-inventory-movement-type',
                        name: 'type',
                        value: filters.type,
                        onChange: (e) => {
                            setFilter('type', e.target.value);
                            setFilter('movement_category_id', '');
                        },
                    }}
                />
            </FilterRowWithClear>

            <FilterRowWithClear
                canClear={filters.movement_category_id.trim() !== ''}
                onClear={() => setFilter('movement_category_id', '')}
                clearLabel="Limpiar filtro de categoría"
            >
                <FormSelect
                    label="Categoría"
                    placeholder="Todas"
                    options={categoryOptions}
                    selectProps={{
                        id: 'filter-inventory-movement-category',
                        name: 'movement_category_id',
                        value: filters.movement_category_id,
                        onChange: (e) =>
                            setFilter('movement_category_id', e.target.value),
                    }}
                />
            </FilterRowWithClear>
        </FilterDropdown>
    );
}
