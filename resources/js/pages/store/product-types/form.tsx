import { FormBooleanSwitch } from '@/components/custom/form-boolean-switch';
import { FormDialogFooter } from '@/components/custom/form-dialog-footer';
import { FormTextInput } from '@/components/custom/form-text-input';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import { isGlobalRecord } from '@/lib/store-master-record';
import { useProductTypeForm } from '@/pages/store/product-types/hooks/use-form';
import type { ProductType } from '@/pages/store/product-types/types';

type ProductTypeFormProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity: ProductType | null;
};

type ProductTypeFormFields = Pick<ProductType, 'name' | 'is_active'>;

export function ProductTypeForm({ open, onOpenChange, entity }: ProductTypeFormProps) {
    const { formProps, headTitle, description } = useProductTypeForm(entity);

    return (
        <InertiaFormDialog<ProductTypeFormFields>
            open={open}
            onOpenChange={onOpenChange}
            title={headTitle}
            description={description}
            formKey={entity?.id ?? 'create'}
            inertiaForm={{ ...formProps }}
        >
            {({ processing, errors }) => (
                <>
                    {entity && isGlobalRecord(entity) ? (
                        <p className="text-muted-foreground text-sm">
                            Registro global del sistema. No se puede editar ni eliminar.
                        </p>
                    ) : null}

                    <FormTextInput
                        label="Nombre"
                        placeholder='Ej. "Medicamentos", "Servicios"'
                        required
                        error={errors.name}
                        inputProps={{
                            id: 'product-type-name',
                            name: 'name',
                            maxLength: 255,
                            defaultValue: entity?.name ?? '',
                            readOnly: entity !== null && isGlobalRecord(entity),
                        }}
                    />

                    <FormBooleanSwitch
                        label="Activo"
                        name="is_active"
                        defaultChecked={entity?.is_active ?? true}
                        error={errors.is_active}
                        confirmUncheck={{
                            when: (entity?.active_products_count ?? 0) > 0,
                            message:
                                'Este tipo tiene productos activos asociados. Si lo desactivas, el sistema puede rechazar el cambio hasta que esos productos se desactiven.',
                        }}
                        disabled={entity !== null && isGlobalRecord(entity)}
                    />

                    <FormDialogFooter
                        onCancel={() => onOpenChange(false)}
                        processing={processing}
                        isEdit={entity !== null}
                        submitDisabled={entity !== null && isGlobalRecord(entity)}
                    />
                </>
            )}
        </InertiaFormDialog>
    );
}
