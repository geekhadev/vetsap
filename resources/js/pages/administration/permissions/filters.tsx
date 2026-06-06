import { FilterDropdown } from '@/components/custom/filter-dropdown';
import { FilterDropdownFooter } from '@/components/custom/filter-dropdown-footer';
import { FilterRowWithClear } from '@/components/custom/filter-row-with-clear';
import type { FormSelectOption } from '@/components/custom/form-select';
import { FormSelect } from '@/components/custom/form-select';
import type { TabledataListPageViewModel } from '@/components/custom/tabledata';
import type {
    ModuleOption,
    Permission,
    PermissionsIndexFiltersDraftFull,
    SystemOption,
} from './types';

type PermissionsIndexFiltersProps = Pick<
    TabledataListPageViewModel<
        Permission,
        PermissionsIndexFiltersDraftFull
    >,
    'filters' | 'setFilter' | 'applyFilters' | 'resetFilters'
> & {
    systems: SystemOption[];
    modules: ModuleOption[];
};

export function PermissionsIndexFilters({
    filters,
    setFilter,
    applyFilters,
    resetFilters,
    systems,
    modules,
}: PermissionsIndexFiltersProps) {
    const systemOptions: FormSelectOption[] = [
        { id: '', label: 'Todos los sistemas' },
        ...systems.map((s) => ({
            id: String(s.id),
            label: s.name,
        })),
    ];

    const filteredModules =
        filters.system_id.trim() === ''
            ? modules
            : modules.filter(
                    (m) => String(m.system_id) === filters.system_id.trim(),
                );

    const moduleOptions: FormSelectOption[] = [
        { id: '', label: 'Todos los módulos' },
        ...filteredModules.map((m) => ({
            id: String(m.id),
            label: m.name,
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
                canClear={filters.system_id.trim() !== ''}
                onClear={() => {
                    setFilter('system_id', '');
                    setFilter('module_id', '');
                }}
                clearLabel="Limpiar filtro de sistema"
            >
                <FormSelect
                    label="Sistema"
                    placeholder=""
                    options={systemOptions}
                    selectProps={{
                        id: 'filter-system_id',
                        name: 'system_id',
                        value: filters.system_id,
                        onChange: (e) => {
                            setFilter('system_id', e.target.value);
                            setFilter('module_id', '');
                        },
                    }}
                />
            </FilterRowWithClear>
            <div className="mt-3">
                <FilterRowWithClear
                    canClear={filters.module_id.trim() !== ''}
                    onClear={() => setFilter('module_id', '')}
                    clearLabel="Limpiar filtro de módulo"
                >
                    <FormSelect
                        label="Módulo"
                        placeholder=""
                        options={moduleOptions}
                        selectProps={{
                            id: 'filter-module_id',
                            name: 'module_id',
                            value: filters.module_id,
                            onChange: (e) =>
                                setFilter('module_id', e.target.value),
                            disabled: filteredModules.length === 0,
                        }}
                    />
                </FilterRowWithClear>
            </div>
        </FilterDropdown>
    );
}
