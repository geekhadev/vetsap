import { FormAppointmentStatusColorPicker } from '@/components/custom/form-appointment-status-color-picker';
import { FormBooleanSwitch } from '@/components/custom/form-boolean-switch';
import { FormDialogFooter } from '@/components/custom/form-dialog-footer';
import { FormTextInput } from '@/components/custom/form-text-input';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import { isAppointmentStatusColorValue } from '@/lib/appointment-status-colors';
import { useAppointmentStatusesForm } from '@/pages/agenda/appointment-statuses/hooks/use-form';
import type { AppointmentStatus } from '@/pages/agenda/appointment-statuses/types';

type AppointmentStatusesFormProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity: AppointmentStatus | null;
};

type AppointmentStatusesFormFields = Pick<
    AppointmentStatus,
    'name' | 'color' | 'is_active'
>;

export function AppointmentStatusesForm({
    open,
    onOpenChange,
    entity,
}: AppointmentStatusesFormProps) {
    const { formProps, headTitle, description } = useAppointmentStatusesForm(entity);

    const defaultColor =
        entity?.color && isAppointmentStatusColorValue(entity.color)
            ? entity.color
            : 'blue';

    return (
        <InertiaFormDialog<AppointmentStatusesFormFields>
            open={open}
            onOpenChange={onOpenChange}
            title={headTitle}
            description={description}
            formKey={entity?.id ?? 'create'}
            inertiaForm={{ ...formProps }}
        >
            {({ processing, errors }) => (
                <>
                    <FormTextInput
                        label="Nombre"
                        placeholder='Ej. "Confirmada", "En sala de espera"'
                        required
                        error={errors.name}
                        inputProps={{
                            id: 'appointment-status-name',
                            name: 'name',
                            maxLength: 255,
                            defaultValue: entity?.name ?? '',
                        }}
                    />

                    <FormAppointmentStatusColorPicker
                        key={`${entity?.id ?? 'create'}-color`}
                        name="color"
                        defaultValue={defaultColor}
                        required
                        error={errors.color}
                    />

                    <FormBooleanSwitch
                        label="Activo"
                        name="is_active"
                        defaultChecked={entity?.is_active ?? true}
                        error={errors.is_active}
                        description="Controla si el estado está disponible al gestionar citas."
                    />

                    <FormDialogFooter
                        onCancel={() => onOpenChange(false)}
                        processing={processing}
                        isEdit={entity !== null}
                    />
                </>
            )}
        </InertiaFormDialog>
    );
}
