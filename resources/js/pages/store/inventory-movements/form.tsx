import { CirclePlus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { FormDatePickerField } from '@/components/custom/form-date-picker-field';
import { FormDialogFooter } from '@/components/custom/form-dialog-footer';
import { FormSelect } from '@/components/custom/form-select';
import { FormTextInput } from '@/components/custom/form-text-input';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useInventoryMovementForm } from '@/pages/store/inventory-movements/hooks/use-form';
import type {
    InventoryMovementDetailLine,
    InventoryMovementTypeValue,
    MovementCategoryOption,
    ProductOption,
} from '@/pages/store/inventory-movements/types';
import { formatProductLabel } from '@/pages/store/inventory-movements/types';

type InventoryMovementFormProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: InventoryMovementTypeValue | null;
    formSessionKey: number;
    movementCategories: MovementCategoryOption[];
    products: ProductOption[];
};

function createEmptyLine(): InventoryMovementDetailLine {
    return {
        key: crypto.randomUUID(),
        product_id: '',
        quantity: '',
    };
}

type InventoryMovementFormFieldsProps = {
    type: InventoryMovementTypeValue;
    movementCategories: MovementCategoryOption[];
    products: ProductOption[];
    processing: boolean;
    errors: Record<string, string>;
    onCancel: () => void;
};

function InventoryMovementFormFields({
    type,
    movementCategories,
    products,
    processing,
    errors,
    onCancel,
}: InventoryMovementFormFieldsProps) {
    const [lines, setLines] = useState<InventoryMovementDetailLine[]>(() => [
        createEmptyLine(),
    ]);
    const [categoryId, setCategoryId] = useState('');

    const categoryOptions = useMemo(
        () =>
            movementCategories
                .filter(
                    (category) =>
                        category.type === type && category.is_active,
                )
                .map((category) => ({
                    id: category.id,
                    label: category.name,
                })),
        [movementCategories, type],
    );

    const productOptions = useMemo(
        () =>
            products.map((product) => ({
                id: product.id,
                label: formatProductLabel(product),
            })),
        [products],
    );

    const selectedProductIds = lines
        .map((line) => line.product_id)
        .filter((id) => id !== '');

    const updateLine = (
        key: string,
        field: keyof Omit<InventoryMovementDetailLine, 'key'>,
        value: string,
    ) => {
        setLines((current) =>
            current.map((line) =>
                line.key === key ? { ...line, [field]: value } : line,
            ),
        );
    };

    const removeLine = (key: string) => {
        setLines((current) =>
            current.length <= 1
                ? current
                : current.filter((line) => line.key !== key),
        );
    };

    return (
        <>
            <input type="hidden" name="type" value={type} />

            <div className="grid gap-4 sm:grid-cols-2">
                <FormDatePickerField
                    label="Fecha"
                    name="moved_at"
                    required
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    error={errors.moved_at}
                    portalled={false}
                />

                <FormSelect
                    label="Categoría de movimiento"
                    required
                    placeholder="Selecciona…"
                    options={categoryOptions}
                    error={errors.movement_category_id}
                    selectProps={{
                        id: 'inventory-movement-category',
                        name: 'movement_category_id',
                        value: categoryId,
                        onChange: (e) => setCategoryId(e.target.value),
                    }}
                />
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                    <Label>Detalle de productos</Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            setLines((current) => [
                                ...current,
                                createEmptyLine(),
                            ])
                        }
                    >
                        <CirclePlus />
                        Agregar línea
                    </Button>
                </div>

                <Separator />

                {typeof errors.details === 'string' ? (
                    <p className="text-destructive text-sm">{errors.details}</p>
                ) : null}

                <div className="space-y-3 pt-2">
                    {lines.map((line, index) => {
                        const availableProducts = productOptions.filter(
                            (option) =>
                                option.id === line.product_id ||
                                !selectedProductIds.includes(option.id),
                        );

                        return (
                            <div
                                key={line.key}
                                className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"
                            >
                                <FormSelect
                                    label={index === 0 ? 'Producto' : undefined}
                                    required
                                    placeholder="Selecciona…"
                                    options={availableProducts}
                                    error={errors[`details.${index}.product_id`]}
                                    selectProps={{
                                        id: `inventory-movement-product-${line.key}`,
                                        name: `details[${index}][product_id]`,
                                        value: line.product_id,
                                        onChange: (e) =>
                                            updateLine(
                                                line.key,
                                                'product_id',
                                                e.target.value,
                                            ),
                                    }}
                                />

                                <div className="flex items-end gap-1">
                                    <FormTextInput
                                        label={
                                            index === 0 ? 'Cantidad' : undefined
                                        }
                                        required
                                        containerClassName="w-32"
                                        error={
                                            errors[`details.${index}.quantity`]
                                        }
                                        inputProps={{
                                            id: `inventory-movement-qty-${line.key}`,
                                            name: `details[${index}][quantity]`,
                                            type: 'number',
                                            min: 1,
                                            step: 1,
                                            inputMode: 'numeric',
                                            value: line.quantity,
                                            onChange: (e) =>
                                                updateLine(
                                                    line.key,
                                                    'quantity',
                                                    e.target.value,
                                                ),
                                        }}
                                    />

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="shrink-0"
                                        disabled={lines.length <= 1}
                                        onClick={() => removeLine(line.key)}
                                        aria-label="Quitar línea"
                                    >
                                        <Trash2 />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <FormDialogFooter
                onCancel={onCancel}
                processing={processing}
                isEdit={false}
                submitLabel="Registrar"
            />
        </>
    );
}

export function InventoryMovementForm({
    open,
    onOpenChange,
    type,
    formSessionKey,
    movementCategories,
    products,
}: InventoryMovementFormProps) {
    const { formProps, headTitle, description } = useInventoryMovementForm(type);

    if (type === null) {
        return null;
    }

    return (
        <InertiaFormDialog
            open={open}
            onOpenChange={onOpenChange}
            title={headTitle}
            description={description}
            formKey={`create-${type}-${formSessionKey}`}
            inertiaForm={{ ...formProps }}
            contentClassName="sm:max-w-3xl"
        >
            {({ processing, errors }) => (
                <InventoryMovementFormFields
                    key={`fields-${type}-${formSessionKey}`}
                    type={type}
                    movementCategories={movementCategories}
                    products={products}
                    processing={processing}
                    errors={errors}
                    onCancel={() => onOpenChange(false)}
                />
            )}
        </InertiaFormDialog>
    );
}
