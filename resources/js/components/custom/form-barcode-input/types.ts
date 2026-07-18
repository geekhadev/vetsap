import type { ComponentProps, ReactNode } from 'react';

export type FormBarcodeInputProps = {
    label?: ReactNode;
    /** Muestra " (*)" en el label; debe coincidir con `required` en el input cuando el campo sea obligatorio. */
    required?: boolean;
    error?: string;
    containerClassName?: string;
    inputClassName?: string;
    labelClassName?: string;
    errorClassName?: string;
    placeholder?: string;
    scanButtonLabel?: string;
    scannerTitle?: string;
    scannerDescription?: string;
    inputProps?: Omit<ComponentProps<'input'>, 'type' | 'value' | 'onChange'>;
};
