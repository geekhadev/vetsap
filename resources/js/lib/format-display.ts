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
