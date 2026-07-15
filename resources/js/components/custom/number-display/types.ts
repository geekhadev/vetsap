export type NumberDisplayProps = {
    value: string | number | null | undefined;
    /** Locale de formato. Por defecto `es-CL` (miles con `.`). */
    locale?: string;
    /** Texto cuando no hay valor o el número es inválido. */
    empty?: string;
    /** Decimales máximos. Por defecto `0`. */
    maximumFractionDigits?: number;
    className?: string;
};
