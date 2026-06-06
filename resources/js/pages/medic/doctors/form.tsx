import { useMemo } from 'react';
import { FormBooleanSwitch } from '@/components/custom/form-boolean-switch';
import { FormDialogFooter } from '@/components/custom/form-dialog-footer';
import { FormSelect } from '@/components/custom/form-select';
import { FormTextInput } from '@/components/custom/form-text-input';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import { useDoctorForm } from '@/pages/medic/doctors/hooks/use-form';
import { DOCUMENT_TYPE_OPTIONS } from '@/pages/medic/doctors/types';
import type { Doctor } from '@/pages/medic/doctors/types';

type DoctorFormProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity: Doctor | null;
};

type DoctorFormFields = Pick<
    Doctor,
    | 'document_type'
    | 'document_number'
    | 'first_name'
    | 'last_name'
    | 'phone'
    | 'email'
    | 'is_active'
    | 'use_web'
>;

export function DoctorForm({ open, onOpenChange, entity }: DoctorFormProps) {
    const { isEdit, formProps, headTitle, description } = useDoctorForm(entity);

    const documentOptions = useMemo(
        () =>
            DOCUMENT_TYPE_OPTIONS.map((opt) => ({
                id: opt.id,
                label: opt.label,
            })),
        [],
    );

    return (
        <InertiaFormDialog<DoctorFormFields>
            open={open}
            onOpenChange={onOpenChange}
            title={headTitle}
            description={description}
            formKey={entity?.id ?? 'create'}
            inertiaForm={{ ...formProps }}
            contentClassName="sm:max-w-2xl"
        >
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormTextInput
                            label="Nombres"
                            placeholder='Ej. "María"'
                            required
                            error={errors.first_name}
                            inputProps={{
                                id: 'doctor-first_name',
                                name: 'first_name',
                                maxLength: 255,
                                defaultValue: entity?.first_name ?? '',
                            }}
                        />

                        <FormTextInput
                            label="Apellidos"
                            placeholder='Ej. "González Pérez"'
                            required
                            error={errors.last_name}
                            inputProps={{
                                id: 'doctor-last_name',
                                name: 'last_name',
                                maxLength: 255,
                                defaultValue: entity?.last_name ?? '',
                            }}
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormSelect
                            label="Tipo de documento"
                            required={!isEdit}
                            placeholder="Selecciona…"
                            options={documentOptions}
                            error={errors.document_type}
                            selectProps={{
                                id: 'doctor-document_type',
                                name: 'document_type',
                                defaultValue: entity?.document_type ?? '',
                                disabled: isEdit,
                            }}
                        />

                        <FormTextInput
                            label="Número de documento"
                            required={!isEdit}
                            placeholder="Ej. 12.345.678-9"
                            error={errors.document_number}
                            inputProps={{
                                id: 'doctor-document_number',
                                name: 'document_number',
                                maxLength: 20,
                                defaultValue: entity?.document_number ?? '',
                                disabled: isEdit,
                            }}
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormTextInput
                            label="Teléfono"
                            error={errors.phone}
                            inputProps={{
                                id: 'doctor-phone',
                                name: 'phone',
                                maxLength: 50,
                                defaultValue: entity?.phone ?? '',
                            }}
                        />

                        <FormTextInput
                            label="Email de contacto"
                            error={errors.email}
                            inputProps={{
                                id: 'doctor-email',
                                name: 'email',
                                type: 'email',
                                maxLength: 255,
                                defaultValue: entity?.email ?? '',
                            }}
                        />
                    </div>

                    <FormBooleanSwitch
                        label="Activo"
                        name="is_active"
                        defaultChecked={entity?.is_active ?? true}
                        error={errors.is_active}
                        description="Disponible para uso interno y asignación en el sistema."
                    />

                    <FormBooleanSwitch
                        label="Citas web públicas"
                        name="use_web"
                        defaultChecked={entity?.use_web ?? false}
                        error={errors.use_web}
                        description="Visible en el formulario de citas de la web pública."
                    />

                    {!isEdit ? (
                        <p className="text-muted-foreground text-sm">
                            Tras crear la ficha podrás asignar servicios desde
                            la acción «Servicios» en el listado.
                        </p>
                    ) : null}

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
