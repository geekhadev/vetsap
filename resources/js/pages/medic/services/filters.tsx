import { Check, RotateCcw, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { FilterDropdown } from '@/components/custom/filter-dropdown';
import { FormSelect } from '@/components/custom/form-select';
import type { TabledataListPageViewModel } from '@/components/custom/tabledata';
import { Button } from '@/components/ui/button';
import { IS_ACTIVE_FILTER_OPTIONS } from './types';
import type { Service, ServicesIndexFiltersDraftFull, SpecialtyOption } from './types';

type ServicesIndexFiltersProps = Pick<
    TabledataListPageViewModel<Service, ServicesIndexFiltersDraftFull>,
    'filters' | 'setFilter' | 'applyFilters' | 'resetFilters'
> & {
    specialties: SpecialtyOption[];
};

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

export function ServicesIndexFilters({
    filters,
    setFilter,
    applyFilters,
    resetFilters,
    specialties,
}: ServicesIndexFiltersProps) {
    const statusOptions = IS_ACTIVE_FILTER_OPTIONS.map((opt) => ({
        id: opt.id,
        label: opt.label,
    }));

    const specialtyOptions = specialties.map((s) => ({
        id: s.id,
        label: s.name,
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
                canClear={filters.specialty_id.trim() !== ''}
                onClear={() => setFilter('specialty_id', '')}
                clearLabel="Limpiar filtro de especialidad"
            >
                <FormSelect
                    label="Especialidad"
                    placeholder="Todas"
                    options={specialtyOptions}
                    selectProps={{
                        id: 'filter-specialty_id',
                        name: 'specialty_id',
                        value: filters.specialty_id,
                        onChange: (e) => setFilter('specialty_id', e.target.value),
                    }}
                />
            </FilterRowWithClear>

            <FilterRowWithClear
                canClear={filters.is_active.trim() !== ''}
                onClear={() => setFilter('is_active', '')}
                clearLabel="Limpiar filtro de estado"
            >
                <FormSelect
                    label="Estado"
                    placeholder=""
                    options={statusOptions}
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
