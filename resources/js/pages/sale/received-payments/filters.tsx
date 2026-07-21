import { FilterDropdown } from '@/components/custom/filter-dropdown';
import { FilterDropdownFooter } from '@/components/custom/filter-dropdown-footer';
import { FilterRowWithClear } from '@/components/custom/filter-row-with-clear';
import { FormSelect } from '@/components/custom/form-select';
import type { TabledataListPageViewModel } from '@/components/custom/tabledata';
import type {
    PaymentMethodOption,
    ReceivedPayment,
    ReceivedPaymentsIndexFiltersDraftFull,
} from '@/pages/sale/received-payments/types';

type ReceivedPaymentsIndexFiltersProps = Pick<
    TabledataListPageViewModel<
        ReceivedPayment,
        ReceivedPaymentsIndexFiltersDraftFull
    >,
    'filters' | 'setFilter' | 'applyFilters' | 'resetFilters'
> & {
    paymentMethods: PaymentMethodOption[];
};

export function ReceivedPaymentsIndexFilters({
    filters,
    setFilter,
    applyFilters,
    resetFilters,
    paymentMethods,
}: ReceivedPaymentsIndexFiltersProps) {
    const methodOptions = paymentMethods.map((method) => ({
        id: method.id,
        label: method.name,
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
                canClear={filters.payment_method_id.trim() !== ''}
                onClear={() => setFilter('payment_method_id', '')}
                clearLabel="Limpiar filtro de método de pago"
            >
                <FormSelect
                    label="Método de pago"
                    placeholder="Todos"
                    options={methodOptions}
                    selectProps={{
                        id: 'filter-payment_method_id',
                        name: 'payment_method_id',
                        value: filters.payment_method_id,
                        onChange: (event) =>
                            setFilter('payment_method_id', event.target.value),
                    }}
                />
            </FilterRowWithClear>
        </FilterDropdown>
    );
}
