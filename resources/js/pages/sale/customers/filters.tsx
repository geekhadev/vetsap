import { Check, RotateCcw, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { FilterDropdown } from '@/components/custom/filter-dropdown';
import { FormSelect } from '@/components/custom/form-select';
import type { TabledataListPageViewModel } from '@/components/custom/tabledata';
import { Button } from '@/components/ui/button';
import {
    DOCUMENT_TYPE_FILTER_OPTIONS
    
    
} from './types';
import type {Customer, CustomersIndexFiltersDraftFull} from './types';

type CustomersIndexFiltersProps = Pick<
    TabledataListPageViewModel<Customer, CustomersIndexFiltersDraftFull>,
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

export function CustomersIndexFilters({
    filters,
    setFilter,
    applyFilters,
    resetFilters,
}: CustomersIndexFiltersProps) {
    const options = DOCUMENT_TYPE_FILTER_OPTIONS.map((opt) => ({
        id: opt.id,
        label: opt.label,
    }));

    return (
        <FilterDropdown
            footer={
                <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                    <Button type="button" onClick={applyFilters}>
                        <Check />
                        Aplicar
                    </Button>
                    <Button type="button" variant="outline" onClick={resetFilters}>
                        <RotateCcw />
                        Reiniciar
                    </Button>
                </div>
            }
        >
            <FilterRowWithClear
                canClear={filters.document_type.trim() !== ''}
                onClear={() => setFilter('document_type', '')}
                clearLabel="Limpiar filtro de tipo de documento"
            >
                <FormSelect
                    label="Tipo de documento"
                    placeholder=""
                    options={options}
                    selectProps={{
                        id: 'filter-document_type',
                        name: 'document_type',
                        value: filters.document_type,
                        onChange: (e) => setFilter('document_type', e.target.value),
                    }}
                />
            </FilterRowWithClear>
        </FilterDropdown>
    );
}
