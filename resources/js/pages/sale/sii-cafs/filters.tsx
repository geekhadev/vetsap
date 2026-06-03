import { Check, RotateCcw, X } from 'lucide-react';
import { useMemo } from 'react';
import { FilterDropdown } from '@/components/custom/filter-dropdown';
import { FormSelect } from '@/components/custom/form-select';
import type { TabledataListPageViewModel } from '@/components/custom/tabledata';
import { Button } from '@/components/ui/button';
import type { SiiCafDocumentTypeOption } from '@/pages/sale/sii-cafs/types';
import type { SiiCafRow, SiiCafsIndexFiltersDraftFull } from '@/pages/sale/sii-cafs/types';

type SiiCafsIndexFiltersProps = {
    documentTypes: SiiCafDocumentTypeOption[];
} & Pick<
    TabledataListPageViewModel<SiiCafRow, SiiCafsIndexFiltersDraftFull>,
    'filters' | 'setFilter' | 'applyFilters' | 'resetFilters'
>;

export function SiiCafsIndexFilters({
    documentTypes,
    filters,
    setFilter,
    applyFilters,
    resetFilters,
}: SiiCafsIndexFiltersProps) {
    const docTypeOptions = useMemo(
        () => [
            { id: '', label: 'Todos los tipos' },
            ...documentTypes.map((t) => ({
                id: t.id,
                label: `${t.code} — ${t.name}`,
            })),
        ],
        [documentTypes],
    );

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
            <div className="flex items-end gap-2">
                <div className="min-w-0 flex-1">
                    <FormSelect
                        label="Tipo de documento"
                        placeholder=""
                        options={docTypeOptions}
                        selectProps={{
                            id: 'filter-sii-caf-doc-type',
                            value: filters.sii_tax_document_type_id,
                            onChange: (e) =>
                                setFilter('sii_tax_document_type_id', e.target.value),
                        }}
                    />
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 shrink-0 text-muted-foreground hover:text-foreground disabled:opacity-40"
                    disabled={filters.sii_tax_document_type_id.trim() === ''}
                    onClick={() => setFilter('sii_tax_document_type_id', '')}
                    aria-label="Limpiar filtro de tipo de documento"
                >
                    <X className="size-4" aria-hidden />
                </Button>
            </div>
        </FilterDropdown>
    );
}
