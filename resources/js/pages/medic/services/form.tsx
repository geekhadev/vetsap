import { useMemo } from 'react';
import { FormBooleanSwitch } from '@/components/custom/form-boolean-switch';
import { FormDialogFooter } from '@/components/custom/form-dialog-footer';
import { FormSelect } from '@/components/custom/form-select';
import { FormTextInput } from '@/components/custom/form-text-input';
import { FormTextarea } from '@/components/custom/form-textarea';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import { buildServiceDurationBlockOptions } from '@/pages/medic/services/config';
import { useServiceForm } from '@/pages/medic/services/hooks/use-form';
import { ServiceUseWebSwitch } from '@/pages/medic/services/service-use-web-switch';
import type { Service, SpecialtyOption } from '@/pages/medic/services/types';

type ServiceFormProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity: Service | null;
    specialties: SpecialtyOption[];
    timeBlockMinutes: number;
};

type ServiceFormFields = Pick<
    Service,
    | 'specialty_id'
    | 'name'
    | 'description'
    | 'price'
    | 'duration_minutes'
    | 'is_active'
    | 'use_web'
>;

export function ServiceForm({
    open,
    onOpenChange,
    entity,
    specialties,
    timeBlockMinutes,
}: ServiceFormProps) {
    const { isEdit, formProps, headTitle, description } = useServiceForm(entity);

    const specialtyOptions = useMemo(
        () =>
            specialties
                .filter((s) => s.is_active || s.id === entity?.specialty_id)
                .map((s) => ({
                    id: s.id,
                    label: s.is_active ? s.name : `${s.name} (inactiva)`,
                })),
        [specialties, entity?.specialty_id],
    );

    const durationBlockOptions = useMemo(
        () =>
            buildServiceDurationBlockOptions(
                timeBlockMinutes,
                entity?.duration_minutes,
            ),
        [entity?.duration_minutes, timeBlockMinutes],
    );

    return (
        <InertiaFormDialog<ServiceFormFields>
            open={open}
            onOpenChange={onOpenChange}
            title={headTitle}
            description={description}
            formKey={entity?.id ?? 'create'}
            inertiaForm={{ ...formProps }}
        >
            {({ processing, errors }) => (
                <>
                    <FormSelect
                        label="Especialidad"
                        required
                        placeholder="Selecciona…"
                        options={specialtyOptions}
                        error={errors.specialty_id}
                        selectProps={{
                            id: 'service-specialty_id',
                            name: 'specialty_id',
                            defaultValue: entity?.specialty_id ?? '',
                        }}
                    />

                    <FormTextInput
                        label="Nombre"
                        placeholder='Ej. "Consulta general", "Vacuna antirrábica"'
                        required
                        error={errors.name}
                        inputProps={{
                            id: 'service-name',
                            name: 'name',
                            maxLength: 255,
                            defaultValue: entity?.name ?? '',
                        }}
                    />

                    <FormTextarea
                        label="Descripción"
                        placeholder="Descripción para la web pública"
                        error={errors.description}
                        textareaProps={{
                            id: 'service-description',
                            name: 'description',
                            maxLength: 1000,
                            rows: 3,
                            defaultValue: entity?.description ?? '',
                        }}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormTextInput
                            label="Precio (CLP)"
                            placeholder="Vacío = consultar precio"
                            error={errors.price}
                            inputProps={{
                                id: 'service-price',
                                name: 'price',
                                type: 'number',
                                min: 0,
                                step: 1,
                                defaultValue: entity?.price ?? '',
                            }}
                        />

                        <FormSelect
                            label="Bloques de tiempo"
                            required
                            placeholder="Selecciona bloques de tiempo…"
                            options={durationBlockOptions}
                            error={errors.duration_minutes}
                            selectProps={{
                                id: 'service-duration_minutes',
                                name: 'duration_minutes',
                                required: true,
                                defaultValue:
                                    entity?.duration_minutes != null
                                        ? String(entity.duration_minutes)
                                        : '',
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

                    <ServiceUseWebSwitch
                        defaultChecked={entity?.use_web ?? false}
                        error={errors.use_web}
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
