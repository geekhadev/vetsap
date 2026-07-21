/**
 * Formatea un RUT chileno con puntos y guión (12.345.678-9).
 * Si el valor no parece RUT, lo devuelve limpio.
 */
export function formatChileanRut(
    value: string | null | undefined,
): string {
    if (value == null) {
        return '—';
    }

    const cleaned = value.trim().replace(/[.\s]/g, '').toUpperCase();

    if (cleaned === '') {
        return '—';
    }

    const match = cleaned.match(/^(\d{1,8})-?([\dkK])$/);

    if (!match) {
        return value.trim();
    }

    const body = match[1];
    const dv = match[2];
    const withDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return `${withDots}-${dv}`;
}

export function formatDteDate(iso: string | null | undefined): string {
    if (!iso) {
        return '—';
    }

    const date = new Date(iso);

    if (Number.isNaN(date.getTime())) {
        return '—';
    }

    return new Intl.DateTimeFormat('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
}

export function formatClpAmount(value: number): string {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0,
    }).format(value);
}

export function resolveDocumentTypeTitle(
    type: { code: string; name: string } | null,
    isBoleta: boolean,
): string {
    const code = type?.code;

    if (code === '33') {
        return 'FACTURA ELECTRÓNICA';
    }

    if (code === '34') {
        return 'FACTURA NO AFECTA O EXENTA ELECTRÓNICA';
    }

    if (code === '39') {
        return 'BOLETA ELECTRÓNICA';
    }

    if (code === '41') {
        return 'BOLETA NO AFECTA O EXENTA ELECTRÓNICA';
    }

    if (code === '61') {
        return 'NOTA DE CRÉDITO ELECTRÓNICA';
    }

    if (code === '56') {
        return 'NOTA DE DÉBITO ELECTRÓNICA';
    }

    if (type?.name) {
        return type.name.toUpperCase();
    }

    return isBoleta ? 'BOLETA ELECTRÓNICA' : 'FACTURA ELECTRÓNICA';
}
