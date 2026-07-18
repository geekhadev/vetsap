import { useMemo } from 'react';
import { FormBarcodeInput } from '@/components/custom/form-barcode-input';
import { FormBooleanSwitch } from '@/components/custom/form-boolean-switch';
import { FormDialogFooter } from '@/components/custom/form-dialog-footer';
import { FormSelect } from '@/components/custom/form-select';
import { FormTextInput } from '@/components/custom/form-text-input';
import { FormTextarea } from '@/components/custom/form-textarea';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import { useProductForm } from '@/pages/store/products/hooks/use-form';
import { formatMasterLabel } from '@/pages/store/products/types';
import type { MasterOption, Product } from '@/pages/store/products/types';

type ProductFormProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity: Product | null;
    productCategories: MasterOption[];
    productTypes: MasterOption[];
};

type ProductFormFields = Pick<
    Product,
    | 'product_category_id'
    | 'product_type_id'
    | 'name'
    | 'barcode'
    | 'description'
    | 'price'
    | 'is_active'
>;

export function ProductForm({
    open,
    onOpenChange,
    entity,
    productCategories,
    productTypes,
}: ProductFormProps) {
    const { formProps, headTitle, description } = useProductForm(entity);

    const categoryOptions = useMemo(
        () =>
            productCategories
                .filter(
                    (c) => c.is_active || c.id === entity?.product_category_id,
                )
                .map((c) => ({
                    id: c.id,
                    label: formatMasterLabel(c, entity?.product_category_id),
                })),
        [productCategories, entity?.product_category_id],
    );

    const typeOptions = useMemo(
        () =>
            productTypes
                .filter((t) => t.is_active || t.id === entity?.product_type_id)
                .map((t) => ({
                    id: t.id,
                    label: formatMasterLabel(t, entity?.product_type_id),
                })),
        [productTypes, entity?.product_type_id],
    );

    return (
        <InertiaFormDialog<ProductFormFields>
            open={open}
            onOpenChange={onOpenChange}
            title={headTitle}
            description={description}
            formKey={entity?.id ?? 'create'}
            inertiaForm={{ ...formProps }}
        >
            {({ processing, errors }) => (
                <>
                    <FormSelect
                        label="Categoría de producto"
                        required
                        placeholder="Selecciona…"
                        options={categoryOptions}
                        error={errors.product_category_id}
                        selectProps={{
                            id: 'product-product_category_id',
                            name: 'product_category_id',
                            defaultValue: entity?.product_category_id ?? '',
                        }}
                    />

                    <FormSelect
                        label="Tipo de producto"
                        required
                        placeholder="Selecciona…"
                        options={typeOptions}
                        error={errors.product_type_id}
                        selectProps={{
                            id: 'product-product_type_id',
                            name: 'product_type_id',
                            defaultValue: entity?.product_type_id ?? '',
                        }}
                    />

                    <FormTextInput
                        label="Nombre"
                        placeholder='Ej. "Antiparasitario 10 kg"'
                        required
                        error={errors.name}
                        inputProps={{
                            id: 'product-name',
                            name: 'name',
                            maxLength: 255,
                            defaultValue: entity?.name ?? '',
                        }}
                    />

                    <FormBarcodeInput
                        label="Código de barras"
                        placeholder="Opcional"
                        error={errors.barcode}
                        inputProps={{
                            id: 'product-barcode',
                            name: 'barcode',
                            maxLength: 64,
                            defaultValue: entity?.barcode ?? '',
                            autoComplete: 'off',
                        }}
                    />

                    <FormTextInput
                        label="Precio"
                        placeholder="Opcional"
                        error={errors.price}
                        inputProps={{
                            id: 'product-price',
                            name: 'price',
                            type: 'number',
                            min: 0,
                            step: 1,
                            defaultValue: entity?.price ?? '',
                        }}
                    />

                    <FormTextarea
                        label="Descripción"
                        placeholder="Opcional"
                        error={errors.description}
                        textareaProps={{
                            id: 'product-description',
                            name: 'description',
                            maxLength: 2000,
                            rows: 3,
                            defaultValue: entity?.description ?? '',
                        }}
                    />

                    <FormBooleanSwitch
                        label="Activo"
                        name="is_active"
                        defaultChecked={entity?.is_active ?? true}
                        error={errors.is_active}
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
