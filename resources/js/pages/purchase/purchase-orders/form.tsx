import { useHttp } from '@inertiajs/react';
import { CirclePlus, ScanBarcode, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { BarcodeScannerDialog } from '@/components/custom/barcode-scanner-dialog';
import { CurrencyDisplay } from '@/components/custom/currency-display';
import { FormDatePickerField } from '@/components/custom/form-date-picker-field';
import { FormDialogFooter } from '@/components/custom/form-dialog-footer';
import { FormSelect } from '@/components/custom/form-select';
import { FormTextInput } from '@/components/custom/form-text-input';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import { ProductAutocomplete } from '@/components/custom/product-autocomplete';
import type { ProductAutocompleteOption } from '@/components/custom/product-autocomplete';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { usePurchaseOrderForm } from '@/pages/purchase/purchase-orders/hooks/use-form';
import {
    formatLineTotal,
    formatSupplierLabel,
    orderTotalFromLines,
} from '@/pages/purchase/purchase-orders/types';
import type {
    PurchaseOrder,
    PurchaseOrderDetailLine,
    PurchaseOrderStatusOption,
    SupplierOption,
} from '@/pages/purchase/purchase-orders/types';
import { barcode as productBarcodeLookup, search as productAutocompleteSearch } from '@/routes/store/products';

type PurchaseOrderFormProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity: PurchaseOrder | null;
    suppliers: SupplierOption[];
    purchaseOrderStatuses: PurchaseOrderStatusOption[];
};

type BarcodeLookupResponse = {
    data: ProductAutocompleteOption | null;
};

function createEmptyLine(): PurchaseOrderDetailLine {
    return {
        key: crypto.randomUUID(),
        product_id: '',
        product_name: '',
        product_barcode: null,
        quantity: '1',
        unit_price: '',
    };
}

function lineFromProduct(
    product: ProductAutocompleteOption,
): PurchaseOrderDetailLine {
    return {
        key: crypto.randomUUID(),
        product_id: product.id,
        product_name: product.name,
        product_barcode: product.barcode,
        quantity: '1',
        unit_price: product.price,
    };
}

function linesFromEntity(entity: PurchaseOrder | null): PurchaseOrderDetailLine[] {
    if (!entity?.details?.length) {
        return [createEmptyLine()];
    }

    return entity.details.map((detail) => ({
        key: crypto.randomUUID(),
        product_id: detail.product_id,
        product_name: detail.product?.name ?? '',
        product_barcode: detail.product?.barcode ?? null,
        quantity: String(detail.quantity),
        unit_price: String(detail.unit_price),
    }));
}

type PurchaseOrderFormFieldsProps = {
    entity: PurchaseOrder | null;
    suppliers: SupplierOption[];
    purchaseOrderStatuses: PurchaseOrderStatusOption[];
    processing: boolean;
    isEdit: boolean;
    errors: Record<string, string>;
    onCancel: () => void;
};

function PurchaseOrderFormFields({
    entity,
    suppliers,
    purchaseOrderStatuses,
    processing,
    isEdit,
    errors,
    onCancel,
}: PurchaseOrderFormFieldsProps) {
    const [lines, setLines] = useState<PurchaseOrderDetailLine[]>(() =>
        linesFromEntity(entity),
    );
    const [scannerOpen, setScannerOpen] = useState(false);
    const linesRef = useRef(lines);
    const barcodeHttp = useHttp({ barcode: '' });
    const barcodeHttpRef = useRef(barcodeHttp);

    useEffect(() => {
        linesRef.current = lines;
    }, [lines]);

    useEffect(() => {
        barcodeHttpRef.current = barcodeHttp;
    }, [barcodeHttp]);

    const supplierOptions = useMemo(
        () =>
            suppliers.map((supplier) => ({
                id: supplier.id,
                label: formatSupplierLabel(supplier),
            })),
        [suppliers],
    );

    const statusOptions = useMemo(
        () =>
            purchaseOrderStatuses.map((status) => ({
                id: status.id,
                label: status.name,
            })),
        [purchaseOrderStatuses],
    );

    const productSearchUrl = productAutocompleteSearch.url();
    const productBarcodeUrl = productBarcodeLookup.url();

    const selectedProductIds = lines
        .map((line) => line.product_id)
        .filter((id) => id !== '');

    const orderTotal = orderTotalFromLines(lines);

    const defaultOrderedAt =
        entity?.ordered_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10);

    const updateLineField = (
        key: string,
        field: 'quantity' | 'unit_price',
        value: string,
    ) => {
        setLines((current) =>
            current.map((line) =>
                line.key === key ? { ...line, [field]: value } : line,
            ),
        );
    };

    const selectProduct = (key: string, product: ProductAutocompleteOption) => {
        setLines((current) =>
            current.map((line) =>
                line.key === key
                    ? {
                          ...line,
                          product_id: product.id,
                          product_name: product.name,
                          product_barcode: product.barcode,
                          unit_price: product.price,
                      }
                    : line,
            ),
        );
    };

    const clearProduct = (key: string) => {
        setLines((current) =>
            current.map((line) =>
                line.key === key
                    ? {
                          ...line,
                          product_id: '',
                          product_name: '',
                          product_barcode: null,
                          unit_price: '',
                      }
                    : line,
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

    const handleBarcodeScan = async (barcode: string) => {
        const normalized = barcode.trim();

        if (normalized === '') {
            return;
        }

        const alreadyInTable = linesRef.current.some((line) => {
            if (line.product_id === '') {
                return false;
            }

            const lineBarcode = line.product_barcode?.trim().toLowerCase() ?? '';

            return lineBarcode !== '' && lineBarcode === normalized.toLowerCase();
        });

        if (alreadyInTable) {
            return;
        }

        try {
            barcodeHttpRef.current.transform(() => ({ barcode: normalized }));
            const response = (await barcodeHttpRef.current.get(
                productBarcodeUrl,
            )) as BarcodeLookupResponse;

            const product = response?.data ?? null;

            if (!product) {
                toast.error(`No se encontró un producto con el código «${normalized}».`);

                return;
            }

            setLines((current) => {
                if (current.some((line) => line.product_id === product.id)) {
                    return current;
                }

                const emptyIndex = current.findIndex(
                    (line) => line.product_id === '',
                );

                if (emptyIndex >= 0) {
                    return current.map((line, index) =>
                        index === emptyIndex
                            ? {
                                  ...line,
                                  product_id: product.id,
                                  product_name: product.name,
                                  product_barcode: product.barcode,
                                  unit_price: product.price,
                                  quantity:
                                      line.quantity.trim() === ''
                                          ? '1'
                                          : line.quantity,
                              }
                            : line,
                    );
                }

                return [...current, lineFromProduct(product)];
            });

            toast.success(`Agregado: ${product.name}`);
        } catch {
            toast.error('No se pudo buscar el producto escaneado.');
        }
    };

    return (
        <>
            <BarcodeScannerDialog
                open={scannerOpen}
                onOpenChange={setScannerOpen}
                onScan={handleBarcodeScan}
            />

            <div className="grid gap-4 sm:grid-cols-3">
                <FormDatePickerField
                    label="Fecha"
                    name="ordered_at"
                    required
                    defaultValue={defaultOrderedAt}
                    error={errors.ordered_at}
                    portalled={false}
                />

                <FormSelect
                    label="Proveedor"
                    required
                    placeholder="Selecciona…"
                    options={supplierOptions}
                    error={errors.supplier_id}
                    selectProps={{
                        id: 'purchase-order-supplier_id',
                        name: 'supplier_id',
                        defaultValue: entity?.supplier_id ?? '',
                    }}
                />

                <FormSelect
                    label="Estado de la orden"
                    required
                    placeholder="Selecciona…"
                    options={statusOptions}
                    error={errors.purchase_order_status_id}
                    selectProps={{
                        id: 'purchase-order-status_id',
                        name: 'purchase_order_status_id',
                        defaultValue: entity?.purchase_order_status_id ?? '',
                    }}
                />
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                    <Label>Detalle de productos</Label>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setScannerOpen(true)}
                        >
                            <ScanBarcode />
                            Escanear
                        </Button>
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
                </div>

                <Separator />

                {typeof errors.details === 'string' ? (
                    <p className="text-destructive text-sm">{errors.details}</p>
                ) : null}

                <div className="space-y-3 pt-2">
                    {lines.map((line, index) => {
                        const excludeIds = selectedProductIds.filter(
                            (id) => id !== line.product_id,
                        );

                        return (
                            <div
                                key={line.key}
                                className="grid gap-3 sm:grid-cols-[minmax(0,1.4fr)_5.5rem_7rem_7rem_auto]"
                            >
                                <ProductAutocomplete
                                    label={index === 0 ? 'Producto' : undefined}
                                    required
                                    name={`details[${index}][product_id]`}
                                    value={line.product_id}
                                    selected={
                                        line.product_id
                                            ? {
                                                  id: line.product_id,
                                                  name: line.product_name,
                                                  barcode: line.product_barcode,
                                              }
                                            : null
                                    }
                                    excludeIds={excludeIds}
                                    searchUrl={productSearchUrl}
                                    error={
                                        errors[`details.${index}.product_id`]
                                    }
                                    id={`purchase-order-product-${line.key}`}
                                    onSelect={(product) =>
                                        selectProduct(line.key, product)
                                    }
                                    onClear={() => clearProduct(line.key)}
                                />

                                <FormTextInput
                                    label={index === 0 ? 'Cantidad' : undefined}
                                    required
                                    error={errors[`details.${index}.quantity`]}
                                    inputProps={{
                                        id: `purchase-order-qty-${line.key}`,
                                        name: `details[${index}][quantity]`,
                                        type: 'number',
                                        min: 1,
                                        step: 1,
                                        inputMode: 'numeric',
                                        value: line.quantity,
                                        onChange: (e) =>
                                            updateLineField(
                                                line.key,
                                                'quantity',
                                                e.target.value,
                                            ),
                                    }}
                                />

                                <FormTextInput
                                    label={index === 0 ? 'Precio' : undefined}
                                    required
                                    error={
                                        errors[`details.${index}.unit_price`]
                                    }
                                    inputProps={{
                                        id: `purchase-order-price-${line.key}`,
                                        name: `details[${index}][unit_price]`,
                                        type: 'number',
                                        min: 0,
                                        step: 1,
                                        inputMode: 'numeric',
                                        value: line.unit_price,
                                        onChange: (e) =>
                                            updateLineField(
                                                line.key,
                                                'unit_price',
                                                e.target.value,
                                            ),
                                    }}
                                />

                                <div className="grid gap-2">
                                    {index === 0 ? (
                                        <Label>Total</Label>
                                    ) : null}
                                    <div className="text-muted-foreground flex h-9 items-center text-sm">
                                        {formatLineTotal(
                                            line.quantity,
                                            line.unit_price,
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-end">
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

            <div className="flex items-center justify-end gap-2 border-t pt-3">
                <span className="text-muted-foreground text-sm">
                    Total de la orden
                </span>
                <CurrencyDisplay
                    value={orderTotal}
                    className="text-base font-medium"
                />
            </div>

            <FormDialogFooter
                onCancel={onCancel}
                processing={processing}
                isEdit={isEdit}
            />
        </>
    );
}

export function PurchaseOrderForm({
    open,
    onOpenChange,
    entity,
    suppliers,
    purchaseOrderStatuses,
}: PurchaseOrderFormProps) {
    const { isEdit, formProps, headTitle, description } =
        usePurchaseOrderForm(entity);

    return (
        <InertiaFormDialog
            open={open}
            onOpenChange={onOpenChange}
            title={headTitle}
            description={description}
            formKey={entity?.id ?? 'create'}
            inertiaForm={{ ...formProps }}
            contentClassName="sm:max-w-4xl"
        >
            {({ processing, errors }) => (
                <PurchaseOrderFormFields
                    key={entity?.id ?? 'create'}
                    entity={entity}
                    suppliers={suppliers}
                    purchaseOrderStatuses={purchaseOrderStatuses}
                    processing={processing}
                    isEdit={isEdit}
                    errors={errors}
                    onCancel={() => onOpenChange(false)}
                />
            )}
        </InertiaFormDialog>
    );
}
