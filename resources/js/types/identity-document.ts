export function formatIdentityDocumentType(
    value: string | null | undefined,
): string {
    if (value == null || value.trim() === '') {
        return '—';
    }

    const normalized = value.trim().toLowerCase();

    if (normalized === 'rut') {
        return 'RUT';
    }

    if (normalized === 'pasaporte') {
        return 'Pasaporte';
    }

    return value.trim();
}

export function formatIdentityDocument(
    documentType: string | null | undefined,
    documentNumber: string | null | undefined,
): string {
    const typeLabel = formatIdentityDocumentType(documentType);
    const number = documentNumber?.trim() || '—';

    if (typeLabel === '—' && number === '—') {
        return '—';
    }

    if (typeLabel === '—') {
        return number;
    }

    if (number === '—') {
        return typeLabel;
    }

    return `${typeLabel} ${number}`;
}
