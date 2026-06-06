import { FormBooleanSwitch } from '@/components/custom/form-boolean-switch';
import { FormDatePickerField } from '@/components/custom/form-date-picker-field';
import { FormDialogFooter } from '@/components/custom/form-dialog-footer';
import { FormTextInput } from '@/components/custom/form-text-input';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import { useHolidaysForm } from '@/pages/agenda/holidays/hooks/use-form';
import type { Holiday } from '@/pages/agenda/holidays/types';

type HolidaysFormProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity: Holiday | null;
};

type HolidaysFormFields = Pick<Holiday, 'name' | 'date' | 'is_active'>;

export function HolidaysForm({ open, onOpenChange, entity }: HolidaysFormProps) {
    const { formProps, headTitle, description } = useHolidaysForm(entity);

    return (
        <InertiaFormDialog<HolidaysFormFields>
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
                        placeholder='Ej. "Año Nuevo", "Fiestas Patrias"'
                        required
                        error={errors.name}
                        inputProps={{
                            id: 'holiday-name',
                            name: 'name',
                            maxLength: 255,
                            defaultValue: entity?.name ?? '',
                        }}
                    />

                    <FormDatePickerField
                        key={`${entity?.id ?? 'create'}-date`}
                        name="date"
                        defaultValue={entity?.date ?? ''}
                        label="Fecha"
                        required
                        error={errors.date}
                        id="holiday-date"
                    />

                    <FormBooleanSwitch
                        label="Activo"
                        name="is_active"
                        defaultChecked={entity?.is_active ?? true}
                        error={errors.is_active}
                        description="Controla si el feriado bloquea la agenda en esa fecha."
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
