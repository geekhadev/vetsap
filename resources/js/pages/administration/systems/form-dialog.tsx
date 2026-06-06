import { FormDialogFooter } from '@/components/custom/form-dialog-footer';
import { FormTextInput } from '@/components/custom/form-text-input';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import { useSystemForm } from '@/pages/administration/systems/hooks/use-form';
import type { System } from '@/pages/administration/systems/types';

type FormDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    system: System | null;
};

export function FormDialog({ open, onOpenChange, system }: FormDialogProps) {
    const { isEdit, formProps, headTitle } = useSystemForm(system);

    const description = isEdit
        ? 'Actualiza el nombre y el slug del sistema.'
        : 'Define el nombre y el slug (el slug lo escribes tú; no se genera solo).';

    return (
        <InertiaFormDialog<Pick<System, 'name' | 'slug'>>
            open={open}
            onOpenChange={onOpenChange}
            title={headTitle}
            description={description}
            formKey={system?.id ?? 'create'}
            inertiaForm={{ ...formProps }}
        >
            {({ processing, errors }) => (
                <>
                    <FormTextInput
                        label="Nombre"
                        placeholder="Ej. Administración"
                        required
                        error={errors.name}
                        inputProps={{
                            id: 'name',
                            name: 'name',
                            maxLength: 255,
                            defaultValue: system?.name ?? '',
                        }}
                    />

                    <FormTextInput
                        label="Slug"
                        placeholder="Ej. administration"
                        required
                        error={errors.slug}
                        inputProps={{
                            id: 'slug',
                            name: 'slug',
                            maxLength: 255,
                            autoComplete: 'off',
                            defaultValue: system?.slug ?? '',
                        }}
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
