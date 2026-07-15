import { format, isValid, parse } from 'date-fns';
import { es } from 'date-fns/locale';

/** Placeholder estándar para valores vacíos en tablas y paneles de detalle. */
export const DISPLAY_EMPTY = '—';

/**
 * Devuelve el texto recortado o un placeholder si es null, undefined o solo espacios.
 */
export function formatOptionalText(
    value: string | null | undefined,
    empty: string = DISPLAY_EMPTY,
): string {
    const trimmed = value?.trim() ?? '';

    return trimmed === '' ? empty : trimmed;
}

/**
 * Devuelve `value` con un sufijo (p. ej. unidad) o el placeholder si está vacío.
 */
export function formatOptionalWithSuffix(
    value: string | null | undefined,
    suffix: string,
    empty: string = DISPLAY_EMPTY,
): string {
    const trimmed = formatOptionalText(value, '');

    if (trimmed === '') {
        return empty;
    }

    const unit = suffix.trim();

    return unit === '' ? trimmed : `${trimmed} ${unit}`;
}

/**
 * Formatea una fecha de nacimiento (`yyyy-MM-dd`) para mostrar en UI (p. ej. `12 ene 2024`).
 */
export function formatBirthDate(
    value: string | null | undefined,
    empty: string = DISPLAY_EMPTY,
): string {
    if (!value?.trim()) {
        return empty;
    }

    const parsed = parse(value, 'yyyy-MM-dd', new Date());

    if (!isValid(parsed)) {
        return value;
    }

    return format(parsed, 'd MMM y', { locale: es });
}
