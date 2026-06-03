import { Check, RotateCcw, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { FilterDropdown } from '@/components/custom/filter-dropdown';
import { FormSelect } from '@/components/custom/form-select';
import type { TabledataListPageViewModel } from '@/components/custom/tabledata';
import { Button } from '@/components/ui/button';
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

function FilterRowWithClear({
    children,
    canClear,
    onClear,
    clearLabel,
}: {
    children: ReactNode;
    canClear: boolean;
    onClear: () => void;
    clearLabel: string;
}) {
    return (
        <div className="flex items-end gap-2">
            <div className="min-w-0 flex-1">{children}</div>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9 shrink-0 text-muted-foreground hover:text-foreground disabled:opacity-40"
                disabled={!canClear}
                onClick={onClear}
                aria-label={clearLabel}
            >
                <X className="size-4" aria-hidden />
            </Button>
        </div>
    );
}

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
                <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                    <Button type="button" onClick={applyFilters}>
                        <Check />
                        Aplicar
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={resetFilters}
                    >
                        <RotateCcw />
                        Reiniciar
                    </Button>
                </div>
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
