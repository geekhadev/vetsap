import { FilterDropdown } from '@/components/custom/filter-dropdown';
import { FilterDropdownFooter } from '@/components/custom/filter-dropdown-footer';
import { FilterRowWithClear } from '@/components/custom/filter-row-with-clear';
import { FormSelect } from '@/components/custom/form-select';
import type { TabledataListPageViewModel } from '@/components/custom/tabledata';
import { formatSupplierLabel } from './types';
import type {
    PurchaseOrder,
    PurchaseOrderStatusOption,
    PurchaseOrdersIndexFiltersDraftFull,
    SupplierOption,
} from './types';

type PurchaseOrdersIndexFiltersProps = Pick<
    TabledataListPageViewModel<PurchaseOrder, PurchaseOrdersIndexFiltersDraftFull>,
    'filters' | 'setFilter' | 'applyFilters' | 'resetFilters'
> & {
    suppliers: SupplierOption[];
    purchaseOrderStatuses: PurchaseOrderStatusOption[];
};

export function PurchaseOrdersIndexFilters({
    filters,
    setFilter,
    applyFilters,
    resetFilters,
    suppliers,
    purchaseOrderStatuses,
}: PurchaseOrdersIndexFiltersProps) {
    const supplierOptions = suppliers.map((supplier) => ({
        id: supplier.id,
        label: formatSupplierLabel(supplier),
    }));

    const statusOptions = purchaseOrderStatuses.map((status) => ({
        id: status.id,
        label: status.name,
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
                canClear={filters.supplier_id.trim() !== ''}
                onClear={() => setFilter('supplier_id', '')}
                clearLabel="Limpiar filtro de proveedor"
            >
                <FormSelect
                    label="Proveedor"
                    placeholder="Todos"
                    options={supplierOptions}
                    selectProps={{
                        id: 'filter-supplier_id',
                        name: 'supplier_id',
                        value: filters.supplier_id,
                        onChange: (e) => setFilter('supplier_id', e.target.value),
                    }}
                />
            </FilterRowWithClear>

            <FilterRowWithClear
                canClear={filters.purchase_order_status_id.trim() !== ''}
                onClear={() => setFilter('purchase_order_status_id', '')}
                clearLabel="Limpiar filtro de estado"
            >
                <FormSelect
                    label="Estado"
                    placeholder="Todos"
                    options={statusOptions}
                    selectProps={{
                        id: 'filter-purchase_order_status_id',
                        name: 'purchase_order_status_id',
                        value: filters.purchase_order_status_id,
                        onChange: (e) =>
                            setFilter('purchase_order_status_id', e.target.value),
                    }}
                />
            </FilterRowWithClear>
        </FilterDropdown>
    );
}
