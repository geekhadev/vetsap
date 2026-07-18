import type { ComponentProps, FocusEvent, ReactNode } from 'react';

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
    /** Se dispara en cada cambio (escritura o escaneo). */
    onValueChange?: (value: string) => void;
    /**
     * Se dispara al terminar de ingresar el código: blur del input o escaneo exitoso.
     * Útil para validar unicidad sin esperar al submit.
     */
    onCommit?: (value: string) => void;
    inputProps?: Omit<
        ComponentProps<'input'>,
        'type' | 'value' | 'onChange' | 'onBlur'
    > & {
        onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
    };
};
