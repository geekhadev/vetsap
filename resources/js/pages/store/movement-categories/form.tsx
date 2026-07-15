import { FormBooleanSwitch } from '@/components/custom/form-boolean-switch';
import { FormDialogFooter } from '@/components/custom/form-dialog-footer';
import { FormSelect } from '@/components/custom/form-select';
import { FormTextInput } from '@/components/custom/form-text-input';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import { isGlobalRecord } from '@/lib/global-record';
import { useMovementCategoryForm } from '@/pages/store/movement-categories/hooks/use-form';
import type {
    MovementCategory,
    MovementTypeOption,
} from '@/pages/store/movement-categories/types';

type MovementCategoryFormProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity: MovementCategory | null;
    movementTypes: MovementTypeOption[];
};

type MovementCategoryFormFields = Pick<
    MovementCategory,
    'name' | 'type' | 'is_active'
>;

export function MovementCategoryForm({
    open,
    onOpenChange,
    entity,
    movementTypes,
}: MovementCategoryFormProps) {
    const { formProps, headTitle, description } = useMovementCategoryForm(entity);
    const isGlobal = entity !== null && isGlobalRecord(entity);

    const typeOptions = movementTypes.map((type) => ({
        id: type.value,
        label: type.label,
    }));

    return (
        <InertiaFormDialog<MovementCategoryFormFields>
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
                        placeholder='Ej. "Compra", "Ajuste", "Robo"'
                        required
                        error={errors.name}
                        inputProps={{
                            id: 'movement-category-name',
                            name: 'name',
                            maxLength: 255,
                            defaultValue: entity?.name ?? '',
                            readOnly: isGlobal,
                        }}
                    />

                    <FormSelect
                        label="Tipo de movimiento"
                        required
                        placeholder="Selecciona…"
                        options={typeOptions}
                        error={errors.type}
                        selectProps={{
                            id: 'movement-category-type',
                            name: 'type',
                            defaultValue: entity?.type ?? '',
                            disabled: isGlobal,
                        }}
                    />

                    <FormBooleanSwitch
                        label="Activa"
                        name="is_active"
                        defaultChecked={entity?.is_active ?? true}
                        error={errors.is_active}
                        confirmUncheck={{
                            when: (entity?.inventory_movements_count ?? 0) > 0,
                            message:
                                'Esta categoría tiene movimientos asociados. ¿Desactivarla de todos modos?',
                        }}
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
