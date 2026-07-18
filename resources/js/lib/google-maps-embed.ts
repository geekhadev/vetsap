/**
 * Extrae el src de un iframe de Google Maps, o deja la URL si ya viene limpia.
 */
export function resolveGoogleMapsEmbedSrc(value: string): string | null {
    const trimmed = value.trim();

    if (trimmed === '') {
        return null;
    }

    const iframeSrc = trimmed.match(
        /<iframe\b[^>]*\bsrc\s*=\s*(["'])(.*?)\1/is,
    );

    if (iframeSrc?.[2]) {
        const src = iframeSrc[2].trim();

        return src === '' ? null : src;
    }

    return trimmed;
}
