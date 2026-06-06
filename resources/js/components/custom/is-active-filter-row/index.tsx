import { FilterRowWithClear } from '@/components/custom/filter-row-with-clear';
import { FormSelect } from '@/components/custom/form-select';
import {
    isActiveFilterOptions
    
} from '@/types/active-record';
import type {ActiveRecordGender} from '@/types/active-record';

export type IsActiveFilterRowProps = {
    value: string;
    onChange: (value: string) => void;
    onClear: () => void;
    gender?: ActiveRecordGender;
    filterId?: string;
};

export function IsActiveFilterRow({
    value,
    onChange,
    onClear,
    gender = 'm',
    filterId = 'filter-is_active',
}: IsActiveFilterRowProps) {
    const options = isActiveFilterOptions(gender).map((opt) => ({
        id: opt.id,
        label: opt.label,
    }));

    return (
        <FilterRowWithClear
            canClear={value.trim() !== ''}
            onClear={onClear}
            clearLabel="Limpiar filtro de estado"
        >
            <FormSelect
                label="Estado"
                placeholder=""
                options={options}
                selectProps={{
                    id: filterId,
                    name: 'is_active',
                    value,
                    onChange: (e) => onChange(e.target.value),
                }}
            />
        </FilterRowWithClear>
    );
}
