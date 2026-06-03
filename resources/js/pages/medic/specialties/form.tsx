import { Save, X } from 'lucide-react';
import { FormSubmitButton } from '@/components/custom/form-submit-button';
import { FormTextInput } from '@/components/custom/form-text-input';
import { FormTextarea } from '@/components/custom/form-textarea';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { useSpecialtyForm } from '@/pages/medic/specialties/hooks/use-form';
import { SpecialtyActiveSwitch } from '@/pages/medic/specialties/specialty-active-switch';
import type { Specialty } from '@/pages/medic/specialties/types';

type SpecialtyFormProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity: Specialty | null;
};

type SpecialtyFormFields = Pick<
    Specialty,
    'name' | 'description' | 'icon' | 'is_active' | 'sort_order'
>;

export function SpecialtyForm({ open, onOpenChange, entity }: SpecialtyFormProps) {
    const { isEdit, formProps, headTitle, description } = useSpecialtyForm(entity);

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

                    <FormTextInput
                        label="Ícono"
                        placeholder="Nombre de ícono Lucide o emoji"
                        error={errors.icon}
                        inputProps={{
                            id: 'specialty-icon',
                            name: 'icon',
                            maxLength: 100,
                            defaultValue: entity?.icon ?? '',
                        }}
                    />

                    <SpecialtyActiveSwitch
                        defaultChecked={entity?.is_active ?? true}
                        hasActiveServices={(entity?.active_services_count ?? 0) > 0}
                        error={errors.is_active}
                    />

                    {isEdit ? (
                        <FormTextInput
                            label="Orden"
                            placeholder="0"
                            error={errors.sort_order}
                            inputProps={{
                                id: 'specialty-sort_order',
                                name: 'sort_order',
                                type: 'number',
                                min: 0,
                                defaultValue: String(entity?.sort_order ?? 0),
                            }}
                        />
                    ) : null}

                    <DialogFooter className="gap-2 sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            <X />
                            Cancelar
                        </Button>
                        <FormSubmitButton
                            type="submit"
                            loading={processing}
                            icon={<Save />}
                            label={isEdit ? 'Guardar cambios' : 'Guardar'}
                            labelLoading="Guardando…"
                            containerClassName="w-auto"
                        />
                    </DialogFooter>
                </>
            )}
        </InertiaFormDialog>
    );
}
