import type { ComponentProps, ReactNode } from 'react';

export type FormTextareaProps = {
    placeholder?: string;
    label?: ReactNode;
    /** Muestra " (*)" en el label; debe coincidir con `required` en el textarea cuando el campo sea obligatorio. */
    required?: boolean;
    error?: string;
    containerClassName?: string;
    textareaClassName?: string;
    labelClassName?: string;
    errorClassName?: string;
    textareaProps?: ComponentProps<'textarea'>;
    /**
     * Muestra un botón de micrófono para dictar por voz (Web Speech API).
     * Requiere `textareaProps.value` + `textareaProps.onChange` controlados, o un `defaultValue` no controlado.
     */
    speechToText?: boolean;
    /** Locale BCP 47 para el reconocimiento. Por defecto `es-CL`. */
    speechLang?: string;
};
