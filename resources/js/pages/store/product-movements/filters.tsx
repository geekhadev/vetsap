import { FilterDropdown } from '@/components/custom/filter-dropdown';
import { FilterDropdownFooter } from '@/components/custom/filter-dropdown-footer';
import { FilterRowWithClear } from '@/components/custom/filter-row-with-clear';
import { FormSelect } from '@/components/custom/form-select';
import type { TabledataListPageViewModel } from '@/components/custom/tabledata';
import type {
    MovementTypeOption,
    ProductFilterOption,
    ProductMovement,
    ProductMovementsIndexFiltersDraftFull,
} from './types';
import { formatProductFilterLabel } from './types';

type ProductMovementsIndexFiltersProps = Pick<
    TabledataListPageViewModel<
        ProductMovement,
        ProductMovementsIndexFiltersDraftFull
    >,
    'filters' | 'setFilter' | 'applyFilters' | 'resetFilters'
> & {
    movementTypes: MovementTypeOption[];
    products: ProductFilterOption[];
};

export function ProductMovementsIndexFilters({
    filters,
    setFilter,
    applyFilters,
    resetFilters,
    movementTypes,
    products,
}: ProductMovementsIndexFiltersProps) {
    const typeOptions = movementTypes.map((type) => ({
        id: type.value,
        label: type.label,
    }));

    const productOptions = products.map((product) => ({
        id: product.id,
        label: formatProductFilterLabel(product),
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
                canClear={filters.product_id.trim() !== ''}
                onClear={() => setFilter('product_id', '')}
                clearLabel="Limpiar filtro de producto"
            >
                <FormSelect
                    label="Producto"
                    placeholder="Todos"
                    options={productOptions}
                    selectProps={{
                        id: 'filter-product-movement-product',
                        name: 'product_id',
                        value: filters.product_id,
                        onChange: (e) => setFilter('product_id', e.target.value),
                    }}
                />
            </FilterRowWithClear>

            <FilterRowWithClear
                canClear={filters.type.trim() !== ''}
                onClear={() => setFilter('type', '')}
                clearLabel="Limpiar filtro de tipo"
            >
                <FormSelect
                    label="Tipo"
                    placeholder="Todos"
                    options={typeOptions}
                    selectProps={{
                        id: 'filter-product-movement-type',
                        name: 'type',
                        value: filters.type,
                        onChange: (e) => setFilter('type', e.target.value),
                    }}
                />
            </FilterRowWithClear>
        </FilterDropdown>
    );
}
