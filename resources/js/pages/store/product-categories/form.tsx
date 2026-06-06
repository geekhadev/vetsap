import { FormBooleanSwitch } from '@/components/custom/form-boolean-switch';
import { FormDialogFooter } from '@/components/custom/form-dialog-footer';
import { FormTextInput } from '@/components/custom/form-text-input';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import { isGlobalRecord } from '@/lib/store-master-record';
import { useProductCategoryForm } from '@/pages/store/product-categories/hooks/use-form';
import type { ProductCategory } from '@/pages/store/product-categories/types';

type ProductCategoryFormProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity: ProductCategory | null;
};

type ProductCategoryFormFields = Pick<ProductCategory, 'name' | 'is_active'>;

export function ProductCategoryForm({ open, onOpenChange, entity }: ProductCategoryFormProps) {
    const { formProps, headTitle, description } = useProductCategoryForm(entity);

    return (
        <InertiaFormDialog<ProductCategoryFormFields>
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
                            id: 'product-category-name',
                            name: 'name',
                            maxLength: 255,
                            defaultValue: entity?.name ?? '',
                            readOnly: entity !== null && isGlobalRecord(entity),
                        }}
                    />

                    <FormBooleanSwitch
                        label="Activa"
                        name="is_active"
                        defaultChecked={entity?.is_active ?? true}
                        error={errors.is_active}
                        confirmUncheck={{
                            when: (entity?.active_products_count ?? 0) > 0,
                            message:
                                'Esta categoría tiene productos activos asociados. ¿Desactivarla de todos modos?',
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
