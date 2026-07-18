import type { ReactNode } from 'react';

export type FormHexColorInputProps = {
    label?: ReactNode;
    required?: boolean;
    error?: string;
    helperText?: ReactNode;
    containerClassName?: string;
    /** Fallback shown in the native color picker when the value is empty. */
    fallbackColor?: string;
    inputProps: {
        id?: string;
        name: string;
        value: string;
        onChange: (value: string) => void;
        disabled?: boolean;
    };
};
