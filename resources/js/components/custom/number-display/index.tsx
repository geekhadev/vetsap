import { cn } from '@/lib/utils';

import type { NumberDisplayProps } from './types';

export type { NumberDisplayProps } from './types';

/** Misma tipografía que montos (JetBrains Mono + dígitos tabulares). */
export const numberDisplayClassName = 'font-currency tabular-nums';

const DEFAULT_LOCALE = 'es-CL';
const DEFAULT_EMPTY = '—';
const DEFAULT_MAX_FRACTION_DIGITS = 0;

function parseNumber(
    value: string | number | null | undefined,
): number | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    const amount = typeof value === 'number' ? value : Number(value);

    return Number.isFinite(amount) ? amount : null;
}

/**
 * Formato numérico con `Intl.NumberFormat` (locale `es-CL` → miles con `.`).
 * En JSX usa `NumberDisplay` para aplicar la tipografía tabular.
 */
export function formatNumberDisplay(
    value: string | number | null | undefined,
    options?: {
        locale?: string;
        empty?: string;
        maximumFractionDigits?: number;
    },
): string {
    const empty = options?.empty ?? DEFAULT_EMPTY;
    const amount = parseNumber(value);

    if (amount === null) {
        return empty;
    }

    const locale = options?.locale ?? DEFAULT_LOCALE;
    const maximumFractionDigits =
        options?.maximumFractionDigits ?? DEFAULT_MAX_FRACTION_DIGITS;

    return new Intl.NumberFormat(locale, {
        maximumFractionDigits,
        minimumFractionDigits: 0,
    }).format(amount);
}

export function NumberDisplay({
    value,
    locale = DEFAULT_LOCALE,
    empty = DEFAULT_EMPTY,
    maximumFractionDigits = DEFAULT_MAX_FRACTION_DIGITS,
    className,
}: NumberDisplayProps) {
    const text = formatNumberDisplay(value, {
        locale,
        empty,
        maximumFractionDigits,
    });

    return (
        <span className={cn(numberDisplayClassName, className)}>{text}</span>
    );
}
