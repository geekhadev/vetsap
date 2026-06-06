import { FilterDropdown } from '@/components/custom/filter-dropdown';
import { FilterDropdownFooter } from '@/components/custom/filter-dropdown-footer';
import { FilterRowWithClear } from '@/components/custom/filter-row-with-clear';
import type { FormSelectOption } from '@/components/custom/form-select';
import { FormSelect } from '@/components/custom/form-select';
import type { TabledataListPageViewModel } from '@/components/custom/tabledata';
import type {
    CompanyOption,
    UserListRow,
    UsersIndexFiltersDraftFull,
} from './types';

type UsersIndexFiltersProps = Pick<
    TabledataListPageViewModel<UserListRow, UsersIndexFiltersDraftFull>,
    'filters' | 'setFilter' | 'applyFilters' | 'resetFilters'
> & {
    companies: CompanyOption[];
};

const TYPE_OPTIONS: FormSelectOption[] = [
    { id: '', label: 'Todos los tipos' },
    { id: 'root', label: 'Root' },
    { id: 'owner', label: 'Owner' },
    { id: 'user', label: 'Usuario' },
];

export function UsersIndexFilters({
    filters,
    setFilter,
    applyFilters,
    resetFilters,
    companies,
}: UsersIndexFiltersProps) {
    const companyOptions: FormSelectOption[] = [
        { id: '', label: 'Todas las empresas' },
        ...companies.map((c) => ({
            id: String(c.id),
            label: c.name,
        })),
    ];

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
                canClear={filters.type.trim() !== ''}
                onClear={() => setFilter('type', '')}
                clearLabel="Limpiar filtro de tipo"
            >
                <FormSelect
                    label="Tipo"
                    placeholder=""
                    options={TYPE_OPTIONS}
                    selectProps={{
                        id: 'filter-type',
                        name: 'type',
                        value: filters.type,
                        onChange: (e) => setFilter('type', e.target.value),
                    }}
                />
            </FilterRowWithClear>
            <div className="mt-3">
                <FilterRowWithClear
                    canClear={filters.company_id.trim() !== ''}
                    onClear={() => setFilter('company_id', '')}
                    clearLabel="Limpiar filtro de empresa"
                >
                    <FormSelect
                        label="Empresa"
                        placeholder=""
                        options={companyOptions}
                        selectProps={{
                            id: 'filter-company_id',
                            name: 'company_id',
                            value: filters.company_id,
                            onChange: (e) =>
                                setFilter('company_id', e.target.value),
                        }}
                    />
                </FilterRowWithClear>
            </div>
        </FilterDropdown>
    );
}
