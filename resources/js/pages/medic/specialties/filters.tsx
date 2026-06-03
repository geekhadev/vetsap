import { Check, RotateCcw, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { FilterDropdown } from '@/components/custom/filter-dropdown';
import { FormSelect } from '@/components/custom/form-select';
import type { TabledataListPageViewModel } from '@/components/custom/tabledata';
import { Button } from '@/components/ui/button';
import { IS_ACTIVE_FILTER_OPTIONS } from './types';
import type { Specialty, SpecialtiesIndexFiltersDraftFull } from './types';

type SpecialtiesIndexFiltersProps = Pick<
    TabledataListPageViewModel<Specialty, SpecialtiesIndexFiltersDraftFull>,
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

export function SpecialtiesIndexFilters({
    filters,
    setFilter,
    applyFilters,
    resetFilters,
}: SpecialtiesIndexFiltersProps) {
    const options = IS_ACTIVE_FILTER_OPTIONS.map((opt) => ({
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
                canClear={filters.is_active.trim() !== ''}
                onClear={() => setFilter('is_active', '')}
                clearLabel="Limpiar filtro de estado"
            >
                <FormSelect
                    label="Estado"
                    placeholder=""
                    options={options}
                    selectProps={{
                        id: 'filter-is_active',
                        name: 'is_active',
                        value: filters.is_active,
                        onChange: (e) => setFilter('is_active', e.target.value),
                    }}
                />
            </FilterRowWithClear>
        </FilterDropdown>
    );
}
