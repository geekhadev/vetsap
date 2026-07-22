import { FilterDropdown } from '@/components/custom/filter-dropdown';
import { FilterDropdownFooter } from '@/components/custom/filter-dropdown-footer';
import { FilterRowWithClear } from '@/components/custom/filter-row-with-clear';
import { FormSelect } from '@/components/custom/form-select';
import { IsActiveFilterRow } from '@/components/custom/is-active-filter-row';
import type { TabledataListPageViewModel } from '@/components/custom/tabledata';
import type { MasterOption, Product, ProductsIndexFiltersDraftFull } from './types';

type ProductsIndexFiltersProps = Pick<
    TabledataListPageViewModel<Product, ProductsIndexFiltersDraftFull>,
    'filters' | 'setFilter' | 'applyFilters' | 'resetFilters'
> & {
    productCategories: MasterOption[];
};

export function ProductsIndexFilters({
    filters,
    setFilter,
    applyFilters,
    resetFilters,
    productCategories,
}: ProductsIndexFiltersProps) {
    const categoryOptions = productCategories.map((c) => ({
        id: c.id,
        label: c.name,
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
                canClear={filters.product_category_id.trim() !== ''}
                onClear={() => setFilter('product_category_id', '')}
                clearLabel="Limpiar filtro de categoría"
            >
                <FormSelect
                    label="Categoría"
                    placeholder="Todas"
                    options={categoryOptions}
                    selectProps={{
                        id: 'filter-product_category_id',
                        name: 'product_category_id',
                        value: filters.product_category_id,
                        onChange: (e) =>
                            setFilter('product_category_id', e.target.value),
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
