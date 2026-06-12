import { cn } from '@/lib/utils';

import type { CurrencyDisplayProps } from './types';

export type { CurrencyDisplayProps } from './types';

/** Clases de presentación para montos (JetBrains Mono + dígitos tabulares). */
export const currencyDisplayClassName = 'font-currency tabular-nums';

const DEFAULT_LOCALE = 'es-CL';
const DEFAULT_CURRENCY = 'CLP';
const DEFAULT_EMPTY = '—';
const DEFAULT_MAX_FRACTION_DIGITS = 0;

function parseAmount(
    value: string | number | null | undefined,
): number | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    const amount = typeof value === 'number' ? value : Number(value);

    return Number.isFinite(amount) ? amount : null;
}

/**
 * Formato de moneda con `Intl.NumberFormat` (locale y código ISO 4217).
 * En JSX usa `CurrencyDisplay` para aplicar la tipografía de montos (JetBrains Mono).
 */
export function formatCurrencyDisplay(
    value: string | number | null | undefined,
    options?: {
        currency?: string;
        locale?: string;
        empty?: string;
        maximumFractionDigits?: number;
    },
): string {
    const empty = options?.empty ?? DEFAULT_EMPTY;
    const amount = parseAmount(value);

    if (amount === null) {
        return empty;
    }

    const locale = options?.locale ?? DEFAULT_LOCALE;
    const currency = options?.currency ?? DEFAULT_CURRENCY;
    const maximumFractionDigits =
        options?.maximumFractionDigits ?? DEFAULT_MAX_FRACTION_DIGITS;

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        maximumFractionDigits,
    }).format(amount);
}

export function CurrencyDisplay({
    value,
    currency = DEFAULT_CURRENCY,
    locale = DEFAULT_LOCALE,
    empty = DEFAULT_EMPTY,
    maximumFractionDigits = DEFAULT_MAX_FRACTION_DIGITS,
    className,
}: CurrencyDisplayProps) {
    const text = formatCurrencyDisplay(value, {
        currency,
        locale,
        empty,
        maximumFractionDigits,
    });

    return (
        <span className={cn(currencyDisplayClassName, className)}>{text}</span>
    );
}
