import { ScanBarcode } from 'lucide-react';
import { useId, useState } from 'react';

import { BarcodeScannerDialog } from '@/components/custom/barcode-scanner-dialog';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

import type { FormBarcodeInputProps } from './types';

export type { FormBarcodeInputProps } from './types';

export function FormBarcodeInput({
    label = undefined,
    required = false,
    error,
    containerClassName,
    inputClassName,
    labelClassName,
    errorClassName,
    placeholder = 'Opcional',
    scanButtonLabel = 'Escanear',
    scannerTitle = 'Escanear código de barras',
    scannerDescription = 'Apunta la cámara al código de barras del producto.',
    inputProps = {},
}: FormBarcodeInputProps) {
    const {
        defaultValue,
        className: inputPropsClassName,
        id: inputPropsId,
        'aria-describedby': inputAriaDescribedBy,
        'aria-invalid': inputAriaInvalid,
        ...restInputProps
    } = inputProps;
    const baseId = useId();
    const inputId = inputPropsId ?? baseId;
    const errorMessageId = `${baseId}-error`;
    const trimmedError = error?.trim() ?? '';
    const hasError = trimmedError.length > 0;
    const [scannerOpen, setScannerOpen] = useState(false);
    const [barcode, setBarcode] = useState(String(defaultValue ?? ''));

    const describedByParts = [
        inputAriaDescribedBy,
        hasError ? errorMessageId : undefined,
    ].filter(Boolean) as string[];
    const ariaDescribedBy =
        describedByParts.length > 0 ? describedByParts.join(' ') : undefined;

    const handleScan = (decoded: string) => {
        setBarcode(decoded);
        setScannerOpen(false);
    };

    return (
        <div className={cn('grid w-full gap-2', containerClassName)}>
            {label ? (
                <Label htmlFor={inputId} className={labelClassName}>
                    {label}
                    {required ? <span aria-hidden="true"> (*)</span> : null}
                </Label>
            ) : null}

            <div className="flex">
                <Input
                    {...restInputProps}
                    id={inputId}
                    type="text"
                    required={required}
                    placeholder={placeholder}
                    value={barcode}
                    onChange={(event) => {
                        setBarcode(event.target.value);
                    }}
                    className={cn(
                        'rounded-e-none',
                        inputPropsClassName,
                        inputClassName,
                    )}
                    aria-invalid={hasError ? true : inputAriaInvalid}
                    aria-describedby={ariaDescribedBy}
                />
                <Button
                    type="button"
                    variant="outline"
                    className="rounded-s-none border-s-0 px-3"
                    aria-label={scanButtonLabel}
                    onClick={() => {
                        setScannerOpen(true);
                    }}
                >
                    <ScanBarcode />
                    <span className="hidden sm:inline">{scanButtonLabel}</span>
                </Button>
            </div>

            <InputError
                id={errorMessageId}
                message={hasError ? trimmedError : undefined}
                className={errorClassName}
            />

            <BarcodeScannerDialog
                open={scannerOpen}
                onOpenChange={setScannerOpen}
                onScan={handleScan}
                title={scannerTitle}
                description={scannerDescription}
                hint="Al detectar el código se completará el campo automáticamente."
            />
        </div>
    );
}
