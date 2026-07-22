import { useMemo } from 'react';
import { FormBarcodeInput } from '@/components/custom/form-barcode-input';
import { FormBooleanSwitch } from '@/components/custom/form-boolean-switch';
import { FormDialogFooter } from '@/components/custom/form-dialog-footer';
import { FormSelect } from '@/components/custom/form-select';
import { FormTextInput } from '@/components/custom/form-text-input';
import { FormTextarea } from '@/components/custom/form-textarea';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import { useBarcodeAvailability } from '@/pages/store/products/hooks/use-barcode-availability';
import { useProductForm } from '@/pages/store/products/hooks/use-form';
import { formatMasterLabel } from '@/pages/store/products/types';
import type { MasterOption, Product } from '@/pages/store/products/types';

type ProductFormProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity: Product | null;
    productCategories: MasterOption[];
};

type ProductFormFields = Pick<
    Product,
    | 'product_category_id'
    | 'name'
    | 'barcode'
    | 'description'
    | 'price'
    | 'tax_treatment'
    | 'is_active'
>;

type ProductFormFieldsProps = {
    entity: Product | null;
    productCategories: MasterOption[];
    processing: boolean;
    errors: Partial<Record<keyof ProductFormFields, string>>;
    onCancel: () => void;
};

function ProductFormFields({
    entity,
    productCategories,
    processing,
    errors,
    onCancel,
}: ProductFormFieldsProps) {
    const { clientError, clearClientError, validateBarcode } =
        useBarcodeAvailability(entity?.id);

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

    return (
        <>
            <FormBarcodeInput
                label="Código de barras"
                placeholder="Opcional — se asigna automáticamente si se deja vacío"
                error={clientError ?? errors.barcode}
                onValueChange={clearClientError}
                onCommit={validateBarcode}
                inputProps={{
                    id: 'product-barcode',
                    name: 'barcode',
                    maxLength: 64,
                    defaultValue: entity?.barcode ?? '',
                    autoComplete: 'off',
                    autoFocus: true,
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

            <FormSelect
                label="Tratamiento tributario"
                required
                placeholder="Selecciona…"
                options={[
                    { id: 'taxable', label: 'Afecto (precio con IVA)' },
                    { id: 'exempt', label: 'Exento' },
                ]}
                error={errors.tax_treatment}
                selectProps={{
                    id: 'product-tax_treatment',
                    name: 'tax_treatment',
                    defaultValue: entity?.tax_treatment ?? 'taxable',
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
                onCancel={onCancel}
                processing={processing}
                isEdit={entity !== null}
            />
        </>
    );
}

export function ProductForm({
    open,
    onOpenChange,
    entity,
    productCategories,
}: ProductFormProps) {
    const { formProps, headTitle, description } = useProductForm(entity);

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
                <ProductFormFields
                    entity={entity}
                    productCategories={productCategories}
                    processing={processing}
                    errors={errors}
                    onCancel={() => onOpenChange(false)}
                />
            )}
        </InertiaFormDialog>
    );
}
