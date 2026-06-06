import { FormBooleanSwitch } from '@/components/custom/form-boolean-switch';
import { FormDialogFooter } from '@/components/custom/form-dialog-footer';
import { FormTextInput } from '@/components/custom/form-text-input';
import { FormTextarea } from '@/components/custom/form-textarea';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import { useSpecialtyForm } from '@/pages/medic/specialties/hooks/use-form';
import type { Specialty } from '@/pages/medic/specialties/types';

type SpecialtyFormProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity: Specialty | null;
};

type SpecialtyFormFields = Pick<Specialty, 'name' | 'description' | 'is_active'>;

export function SpecialtyForm({ open, onOpenChange, entity }: SpecialtyFormProps) {
    const { formProps, headTitle, description } = useSpecialtyForm(entity);

    return (
        <InertiaFormDialog<SpecialtyFormFields>
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
                        placeholder='Ej. "Medicina General", "Cirugía"'
                        required
                        error={errors.name}
                        inputProps={{
                            id: 'specialty-name',
                            name: 'name',
                            maxLength: 255,
                            defaultValue: entity?.name ?? '',
                        }}
                    />

                    <FormTextarea
                        label="Descripción"
                        placeholder="Descripción corta para la web pública"
                        error={errors.description}
                        textareaProps={{
                            id: 'specialty-description',
                            name: 'description',
                            maxLength: 1000,
                            rows: 3,
                            defaultValue: entity?.description ?? '',
                        }}
                    />

                    <FormBooleanSwitch
                        label="Activa"
                        name="is_active"
                        defaultChecked={entity?.is_active ?? true}
                        error={errors.is_active}
                        description="Controla la visibilidad en la web pública y en la agenda."
                        confirmUncheck={{
                            when: (entity?.active_services_count ?? 0) > 0,
                            message:
                                'Esta especialidad tiene servicios activos asociados. Si la desactivas, dejará de mostrarse en la web pública y en el selector de citas, pero el sistema puede rechazar el cambio hasta que esos servicios se desactiven.',
                        }}
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
