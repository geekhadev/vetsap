export type CurrencyDisplayProps = {
    value: string | number | null | undefined;
    /** Código ISO 4217. Por defecto `CLP`. */
    currency?: string;
    /** Locale de formato. Por defecto `es-CL`. */
    locale?: string;
    /** Texto cuando no hay valor o el monto es inválido. */
    empty?: string;
    /** Decimales máximos. Por defecto `0` (pesos chilenos sin decimales). */
    maximumFractionDigits?: number;
    className?: string;
};
