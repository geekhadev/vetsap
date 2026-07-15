import type { ComponentProps, ReactNode } from 'react';

export type FormTextInputProps = {
    type?: string;
    placeholder?: string;
    label?: ReactNode;
    /** Muestra " (*)" en el label; debe coincidir con `required` en el input cuando el campo sea obligatorio. */
    required?: boolean;
    error?: string;
    containerClassName?: string;
    inputClassName?: string;
    labelClassName?: string;
    errorClassName?: string;
    inputProps?: ComponentProps<'input'>;
};
