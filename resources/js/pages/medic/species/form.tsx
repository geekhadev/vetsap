import { Save, X } from 'lucide-react';
import { FormSubmitButton } from '@/components/custom/form-submit-button';
import { FormTextInput } from '@/components/custom/form-text-input';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { useSpeciesForm } from '@/pages/medic/species/hooks/use-form';
import { SpeciesActiveSwitch } from '@/pages/medic/species/species-active-switch';
import type { Species } from '@/pages/medic/species/types';

type SpeciesFormProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity: Species | null;
};

type SpeciesFormFields = Pick<
    Species,
    'name' | 'is_active' | 'sort_order'
>;

export function SpeciesForm({ open, onOpenChange, entity }: SpeciesFormProps) {
    const { isEdit, formProps, headTitle, description } = useSpeciesForm(entity);

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
                        }}
                    />

                    <SpeciesActiveSwitch
                        defaultChecked={entity?.is_active ?? true}
                        error={errors.is_active}
                    />

                    {isEdit ? (
                        <FormTextInput
                            label="Orden"
                            placeholder="0"
                            error={errors.sort_order}
                            inputProps={{
                                id: 'species-sort_order',
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
