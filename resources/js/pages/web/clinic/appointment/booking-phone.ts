export function normalizePhone(phone: string): string {
    return phone.replace(/\D/g, '').slice(-9);
}

export function isValidChileanMobilePhone(phone: string): boolean {
    const normalized = normalizePhone(phone);

    return normalized.length === 9 && normalized.startsWith('9');
}
