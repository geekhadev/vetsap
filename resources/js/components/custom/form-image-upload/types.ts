import type { ReactNode } from 'react';

export type FormImageUploadProps = {
    label?: string;
    /** Muestra " (*)" en el label cuando el campo es obligatorio. */
    required?: boolean;
    error?: string;
    helperText?: ReactNode;
    previewUrl?: string | null;
    previewAlt?: string;
    emptyLabel?: string;
    changeLabel?: string;
    accept?: string;
    disabled?: boolean;
    processing?: boolean;
    containerClassName?: string;
    previewClassName?: string;
    labelClassName?: string;
    errorClassName?: string;
    onFileSelect: (file: File, input: HTMLInputElement) => void;
};
