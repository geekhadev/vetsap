import { cn } from '@/lib/utils';
import type { DateDisplayMode, DateDisplayProps } from './types';

export type { DateDisplayMode, DateDisplayProps } from './types';

const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function pad2(n: number): string {
    return String(n).padStart(2, '0');
}

/**
 * Interpreta `yyyy-MM-dd` como fecha de calendario local (sin desfase UTC).
 * El resto de strings se delegan a `Date` (ISO con zona, etc.).
 */
function parseToDate(
    value: string | Date | null | undefined,
): Date | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }

    const dateOnly = DATE_ONLY_RE.exec(value.trim());

    if (dateOnly) {
        const year = Number(dateOnly[1]);
        const monthIndex = Number(dateOnly[2]) - 1;
        const day = Number(dateOnly[3]);
        const d = new Date(year, monthIndex, day);

        if (
            d.getFullYear() !== year ||
            d.getMonth() !== monthIndex ||
            d.getDate() !== day
        ) {
            return null;
        }

        return d;
    }

    const d = new Date(value);

    return Number.isNaN(d.getTime()) ? null : d;
}

function resolveDateTimeAttr(
    value: string | Date | null | undefined,
    parsed: Date,
): string {
    if (typeof value === 'string' && value.trim() !== '') {
        return value.trim();
    }

    return parsed.toISOString();
}

/**
 * Formato fijo `dd/mm/aaaa` y hora `HH:mm` (24 h) en hora local.
 * Mismo estándar visual en timeline, ficha de paciente, tablas, etc.
 */
export function formatDateDisplay(
    value: string | Date | null | undefined,
    mode: DateDisplayMode,
    empty = '—',
): string {
    const d = parseToDate(value);

    if (!d) {
        return empty;
    }

    const datePart = `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
    const timePart = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

    if (mode === 'date') {
        return datePart;
    }

    if (mode === 'time') {
        return timePart;
    }

    return `${datePart} ${timePart}`;
}

export function DateDisplay({
    value,
    mode,
    empty = '—',
    as = 'time',
    className,
}: DateDisplayProps) {
    const d = parseToDate(value);
    const text = d ? formatDateDisplay(d, mode, empty) : empty;

    if (!d || as === 'span') {
        return <span className={cn(className)}>{text}</span>;
    }

    return (
        <time dateTime={resolveDateTimeAttr(value, d)} className={cn(className)}>
            {text}
        </time>
    );
}
