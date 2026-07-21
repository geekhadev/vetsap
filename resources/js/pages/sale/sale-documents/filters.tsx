import { FilterDropdown } from '@/components/custom/filter-dropdown';
import { FilterDropdownFooter } from '@/components/custom/filter-dropdown-footer';
import { FilterRowWithClear } from '@/components/custom/filter-row-with-clear';
import { FormSelect } from '@/components/custom/form-select';
import type { TabledataListPageViewModel } from '@/components/custom/tabledata';
import type {
    SaleDocument,
    SaleDocumentsIndexFiltersDraftFull,
} from '@/pages/sale/sale-documents/types';

type SaleDocumentsIndexFiltersProps = Pick<
    TabledataListPageViewModel<
        SaleDocument,
        SaleDocumentsIndexFiltersDraftFull
    >,
    'filters' | 'setFilter' | 'applyFilters' | 'resetFilters'
>;

export function SaleDocumentsIndexFilters({
    filters,
    setFilter,
    applyFilters,
    resetFilters,
}: SaleDocumentsIndexFiltersProps) {
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
                canClear={filters.status.trim() !== ''}
                onClear={() => setFilter('status', '')}
                clearLabel="Limpiar filtro de estado"
            >
                <FormSelect
                    label="Estado"
                    placeholder="Todos"
                    options={[
                        { id: 'draft', label: 'Borrador' },
                        { id: 'issued', label: 'Emitido' },
                        { id: 'voided', label: 'Anulado' },
                    ]}
                    selectProps={{
                        value: filters.status,
                        onChange: (event) =>
                            setFilter('status', event.target.value),
                    }}
                />
            </FilterRowWithClear>

            <FilterRowWithClear
                canClear={filters.payment_status.trim() !== ''}
                onClear={() => setFilter('payment_status', '')}
                clearLabel="Limpiar filtro de estado de pago"
            >
                <FormSelect
                    label="Estado de pago"
                    placeholder="Todos"
                    options={[
                        { id: 'pending', label: 'Pendiente' },
                        { id: 'partial', label: 'Parcial' },
                        { id: 'paid', label: 'Pagado' },
                    ]}
                    selectProps={{
                        value: filters.payment_status,
                        onChange: (event) =>
                            setFilter('payment_status', event.target.value),
                    }}
                />
            </FilterRowWithClear>
        </FilterDropdown>
    );
}
