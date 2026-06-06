import { useMemo } from 'react';
import { FormBooleanSwitch } from '@/components/custom/form-boolean-switch';
import { FormDatePickerField } from '@/components/custom/form-date-picker-field';
import { FormDialogFooter } from '@/components/custom/form-dialog-footer';
import { FormSelect } from '@/components/custom/form-select';
import { FormTextInput } from '@/components/custom/form-text-input';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import { usePatientForm } from '@/pages/medic/patients/hooks/use-form';
import type {
    CustomerOption,
    Patient,
    SpeciesOption,
} from '@/pages/medic/patients/types';
import { SEX_OPTIONS } from '@/pages/medic/patients/types';

type PatientFormProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity: Patient | null;
    speciesOptions: SpeciesOption[];
    customerOptions?: CustomerOption[];
    fixedCustomerId?: string;
    redirectTo?: 'customers' | 'patients';
};

type PatientFormFields = Pick<
    Patient,
    | 'customer_id'
    | 'species_id'
    | 'record_number'
    | 'name'
    | 'breed'
    | 'sex'
    | 'birth_date'
    | 'weight_kg'
    | 'is_sterilized'
    | 'colors'
    | 'blood_type'
    | 'microchip_number'
    | 'is_active'
>;

export function PatientForm({
    open,
    onOpenChange,
    entity,
    speciesOptions,
    customerOptions = [],
    fixedCustomerId,
    redirectTo = 'patients',
}: PatientFormProps) {
    const { isEdit, formProps, headTitle, description } = usePatientForm({
        entity,
        redirectTo,
    });

    const speciesSelectOptions = useMemo(
        () => speciesOptions.map((item) => ({ id: item.id, label: item.name })),
        [speciesOptions],
    );

    const customerSelectOptions = useMemo(
        () =>
            customerOptions.map((item) => ({
                id: item.id,
                label: `${item.name} (${item.document_number})`,
            })),
        [customerOptions],
    );

    const sexSelectOptions = useMemo(
        () => SEX_OPTIONS.map((item) => ({ id: item.id, label: item.label })),
        [],
    );

    const resolvedCustomerId = fixedCustomerId ?? entity?.customer_id ?? '';

    return (
        <InertiaFormDialog<PatientFormFields>
            open={open}
            onOpenChange={onOpenChange}
            title={headTitle}
            description={description}
            formKey={`${entity?.id ?? 'create'}-${fixedCustomerId ?? 'global'}`}
            inertiaForm={{ ...formProps }}
            contentClassName="sm:max-w-3xl"
        >
            {({ processing, errors }) => (
                <>
                    <input type="hidden" name="redirect_to" value={redirectTo} />

                    {fixedCustomerId ? (
                        <input type="hidden" name="customer_id" value={fixedCustomerId} />
                    ) : (
                        <FormSelect
                            label="Cliente (dueño)"
                            required
                            placeholder="Selecciona…"
                            options={customerSelectOptions}
                            error={errors.customer_id}
                            selectProps={{
                                id: 'patient-customer_id',
                                name: 'customer_id',
                                defaultValue: resolvedCustomerId,
                            }}
                        />
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormTextInput
                            label="Ficha"
                            required
                            placeholder="Ej. PAC-001"
                            error={errors.record_number}
                            inputProps={{
                                id: 'patient-record_number',
                                name: 'record_number',
                                maxLength: 50,
                                defaultValue: entity?.record_number ?? '',
                            }}
                        />

                        <FormTextInput
                            label="Nombre"
                            required
                            placeholder='Ej. "Luna"'
                            error={errors.name}
                            inputProps={{
                                id: 'patient-name',
                                name: 'name',
                                maxLength: 255,
                                defaultValue: entity?.name ?? '',
                            }}
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormSelect
                            label="Especie"
                            required
                            placeholder="Selecciona…"
                            options={speciesSelectOptions}
                            error={errors.species_id}
                            selectProps={{
                                id: 'patient-species_id',
                                name: 'species_id',
                                defaultValue: entity?.species_id ?? '',
                            }}
                        />

                        <FormTextInput
                            label="Raza"
                            placeholder="Ej. Labrador"
                            error={errors.breed}
                            inputProps={{
                                id: 'patient-breed',
                                name: 'breed',
                                maxLength: 255,
                                defaultValue: entity?.breed ?? '',
                            }}
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <FormSelect
                            label="Sexo"
                            required
                            placeholder="Selecciona…"
                            options={sexSelectOptions}
                            error={errors.sex}
                            selectProps={{
                                id: 'patient-sex',
                                name: 'sex',
                                defaultValue: entity?.sex ?? '',
                            }}
                        />

                        <FormDatePickerField
                            key={`${entity?.id ?? 'create'}-${fixedCustomerId ?? 'global'}-birth_date`}
                            name="birth_date"
                            defaultValue={entity?.birth_date ?? ''}
                            label="Fecha de nacimiento"
                            disableFutureDates
                            error={errors.birth_date}
                            id="patient-birth_date"
                        />

                        <FormTextInput
                            label="Peso (kg)"
                            placeholder="Ej. 12.5"
                            error={errors.weight_kg}
                            inputProps={{
                                id: 'patient-weight_kg',
                                name: 'weight_kg',
                                type: 'number',
                                step: '0.01',
                                min: '0',
                                max: '9999.99',
                                defaultValue: entity?.weight_kg ?? '',
                            }}
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormTextInput
                            label="Colores"
                            placeholder="Ej. Negro con manchas blancas"
                            error={errors.colors}
                            inputProps={{
                                id: 'patient-colors',
                                name: 'colors',
                                maxLength: 500,
                                defaultValue: entity?.colors ?? '',
                            }}
                        />

                        <FormTextInput
                            label="Tipo sanguíneo"
                            placeholder="Ej. DEA 1.1"
                            error={errors.blood_type}
                            inputProps={{
                                id: 'patient-blood_type',
                                name: 'blood_type',
                                maxLength: 50,
                                defaultValue: entity?.blood_type ?? '',
                            }}
                        />
                    </div>

                    <FormTextInput
                        label="Número de chip"
                        placeholder="Microchip"
                        error={errors.microchip_number}
                        inputProps={{
                            id: 'patient-microchip_number',
                            name: 'microchip_number',
                            maxLength: 50,
                            defaultValue: entity?.microchip_number ?? '',
                        }}
                    />

                    <FormBooleanSwitch
                        label="Esterilizado"
                        name="is_sterilized"
                        defaultChecked={entity?.is_sterilized ?? false}
                        error={errors.is_sterilized}
                        description="Indica si el paciente está castrado o esterilizado."
                    />

                    <FormBooleanSwitch
                        label="Activo"
                        name="is_active"
                        defaultChecked={entity?.is_active ?? true}
                        error={errors.is_active}
                        description="Los pacientes inactivos no aparecen en flujos operativos."
                    />

                    <FormDialogFooter
                        onCancel={() => onOpenChange(false)}
                        processing={processing}
                        isEdit={isEdit}
                    />
                </>
            )}
        </InertiaFormDialog>
    );
}
