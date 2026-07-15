import { FormBooleanSwitch } from '@/components/custom/form-boolean-switch';
import { FormDialogFooter } from '@/components/custom/form-dialog-footer';
import { FormTextInput } from '@/components/custom/form-text-input';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import { isGlobalRecord } from '@/lib/global-record';
import { useSpeciesForm } from '@/pages/medic/species/hooks/use-form';
import type { Species } from '@/pages/medic/species/types';

type SpeciesFormProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity: Species | null;
};

type SpeciesFormFields = Pick<Species, 'name' | 'is_active'>;

export function SpeciesForm({ open, onOpenChange, entity }: SpeciesFormProps) {
    const { formProps, headTitle, description } = useSpeciesForm(entity);
    const isGlobal = entity !== null && isGlobalRecord(entity);

    return (
        <InertiaFormDialog<SpeciesFormFields>
            open={open}
            onOpenChange={onOpenChange}
            title={headTitle}
            description={description}
            formKey={entity?.id ?? 'create'}
            inertiaForm={{ ...formProps }}
        >
            {({ processing, errors }) => (
                <>
                    {isGlobal ? (
                        <p className="text-muted-foreground text-sm">
                            Registro global del sistema. No se puede editar ni eliminar.
                        </p>
                    ) : null}

                    <FormTextInput
                        label="Nombre"
                        placeholder='Ej. "Iguana", "Hurón"'
                        required
                        error={errors.name}
                        inputProps={{
                            id: 'species-name',
                            name: 'name',
                            maxLength: 255,
                            defaultValue: entity?.name ?? '',
                            readOnly: isGlobal,
                        }}
                    />

                    <FormBooleanSwitch
                        label="Activa"
                        name="is_active"
                        defaultChecked={entity?.is_active ?? true}
                        error={errors.is_active}
                        description="Controla si la especie aparece en el registro de pacientes."
                        disabled={isGlobal}
                    />

                    <FormDialogFooter
                        onCancel={() => onOpenChange(false)}
                        processing={processing}
                        isEdit={entity !== null}
                        submitDisabled={isGlobal}
                    />
                </>
            )}
        </InertiaFormDialog>
    );
}
