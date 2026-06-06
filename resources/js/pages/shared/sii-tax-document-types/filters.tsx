import { FilterDropdown } from '@/components/custom/filter-dropdown';
import { FilterDropdownFooter } from '@/components/custom/filter-dropdown-footer';
import { FilterRowWithClear } from '@/components/custom/filter-row-with-clear';
import { FormSelect } from '@/components/custom/form-select';
import type { TabledataListPageViewModel } from '@/components/custom/tabledata';
import { CONFIG_TABLEDATA } from '@/pages/shared/sii-tax-document-types/config';
import type {
    SiiTaxDocumentType,
    SiiTaxDocumentTypesIndexFiltersDraftFull,
} from './types';

type SiiTaxDocumentTypesIndexFiltersProps = Pick<
    TabledataListPageViewModel<
        SiiTaxDocumentType,
        SiiTaxDocumentTypesIndexFiltersDraftFull
    >,
    'filters' | 'setFilter' | 'applyFilters' | 'resetFilters'
>;

export function SiiTaxDocumentTypesIndexFilters({
    filters,
    setFilter,
    applyFilters,
    resetFilters,
}: SiiTaxDocumentTypesIndexFiltersProps) {
    const usageOptions = [...CONFIG_TABLEDATA.USAGE_FILTER_OPTIONS];

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
                canClear={filters.usage.trim() !== ''}
                onClear={() => setFilter('usage', '')}
                clearLabel="Limpiar filtro de ámbito"
            >
                <FormSelect
                    label="Ámbito"
                    placeholder=""
                    options={usageOptions}
                    selectProps={{
                        id: 'filter-usage',
                        value: filters.usage,
                        onChange: (e) => setFilter('usage', e.target.value),
                    }}
                />
            </FilterRowWithClear>
        </FilterDropdown>
    );
}
