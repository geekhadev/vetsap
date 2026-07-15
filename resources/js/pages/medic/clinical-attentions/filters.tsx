import { FilterDropdown } from '@/components/custom/filter-dropdown';
import { FilterDropdownFooter } from '@/components/custom/filter-dropdown-footer';
import { FilterRowWithClear } from '@/components/custom/filter-row-with-clear';
import { FormSelect } from '@/components/custom/form-select';
import type { TabledataListPageViewModel } from '@/components/custom/tabledata';
import type {
    ClinicalAttention,
    ClinicalAttentionsIndexFiltersDraftFull,
    DoctorOption,
    PatientOption,
    TemplateOption,
} from './types';

type ClinicalAttentionsIndexFiltersProps = Pick<
    TabledataListPageViewModel<ClinicalAttention, ClinicalAttentionsIndexFiltersDraftFull>,
    'filters' | 'setFilter' | 'applyFilters' | 'resetFilters'
> & {
    patients: PatientOption[];
    doctors: DoctorOption[];
    templates: TemplateOption[];
};

export function ClinicalAttentionsIndexFilters({
    filters,
    setFilter,
    applyFilters,
    resetFilters,
    patients,
    doctors,
    templates,
}: ClinicalAttentionsIndexFiltersProps) {
    const patientOptions = patients.map((p) => ({
        id: p.id,
        label: `${p.name} (${p.record_number})`,
    }));
    const doctorOptions = doctors.map((d) => ({ id: d.id, label: `${d.first_name} ${d.last_name}` }));
    const templateOptions = templates.map((t) => ({ id: t.id, label: t.name }));

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
                canClear={filters.patient_id.trim() !== ''}
                onClear={() => setFilter('patient_id', '')}
                clearLabel="Limpiar filtro de paciente"
            >
                <FormSelect
                    label="Paciente"
                    placeholder="Todos"
                    options={patientOptions}
                    selectProps={{
                        id: 'clinical-attentions-filter-patient_id',
                        name: 'patient_id',
                        value: filters.patient_id,
                        onChange: (e) => setFilter('patient_id', e.target.value),
                    }}
                />
            </FilterRowWithClear>

            <FilterRowWithClear
                canClear={filters.doctor_id.trim() !== ''}
                onClear={() => setFilter('doctor_id', '')}
                clearLabel="Limpiar filtro de médico"
            >
                <FormSelect
                    label="Médico"
                    placeholder="Todos"
                    options={doctorOptions}
                    selectProps={{
                        id: 'clinical-attentions-filter-doctor_id',
                        name: 'doctor_id',
                        value: filters.doctor_id,
                        onChange: (e) => setFilter('doctor_id', e.target.value),
                    }}
                />
            </FilterRowWithClear>

            <FilterRowWithClear
                canClear={filters.template_id.trim() !== ''}
                onClear={() => setFilter('template_id', '')}
                clearLabel="Limpiar filtro de plantilla"
            >
                <FormSelect
                    label="Plantilla"
                    placeholder="Todas"
                    options={templateOptions}
                    selectProps={{
                        id: 'clinical-attentions-filter-template_id',
                        name: 'template_id',
                        value: filters.template_id,
                        onChange: (e) => setFilter('template_id', e.target.value),
                    }}
                />
            </FilterRowWithClear>
        </FilterDropdown>
    );
}
