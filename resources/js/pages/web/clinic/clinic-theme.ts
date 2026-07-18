/** Default clinic brand color (Tailwind cyan-500). */
export const CLINIC_DEFAULT_PRIMARY_COLOR = '#06B6D4';

type Rgb = { r: number; g: number; b: number };

function parseHexColor(hex: string): Rgb | null {
    const normalized = hex.trim().replace(/^#/, '');

    if (!/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(normalized)) {
        return null;
    }

    const full =
        normalized.length === 3
            ? normalized
                  .split('')
                  .map((char) => `${char}${char}`)
                  .join('')
            : normalized;

    return {
        r: Number.parseInt(full.slice(0, 2), 16),
        g: Number.parseInt(full.slice(2, 4), 16),
        b: Number.parseInt(full.slice(4, 6), 16),
    };
}

function toHex({ r, g, b }: Rgb): string {
    const channel = (value: number): string =>
        Math.round(Math.min(255, Math.max(0, value)))
            .toString(16)
            .padStart(2, '0');

    return `#${channel(r)}${channel(g)}${channel(b)}`.toUpperCase();
}

/** Mix `base` toward `target` by `amount` (0–1). */
function mix(base: Rgb, target: Rgb, amount: number): string {
    return toHex({
        r: base.r + (target.r - base.r) * amount,
        g: base.g + (target.g - base.g) * amount,
        b: base.b + (target.b - base.b) * amount,
    });
}

const WHITE: Rgb = { r: 255, g: 255, b: 255 };
const BLACK: Rgb = { r: 0, g: 0, b: 0 };

export type ClinicBrandCssVars = {
    '--clinic-primary': string;
    '--color-clinic-50': string;
    '--color-clinic-100': string;
    '--color-clinic-200': string;
    '--color-clinic-300': string;
    '--color-clinic-400': string;
    '--color-clinic-500': string;
    '--color-clinic-600': string;
    '--color-clinic-700': string;
    '--color-clinic-800': string;
    '--color-clinic-900': string;
};

/**
 * Builds the full clinic brand palette as CSS variables.
 * Sets `--color-clinic-*` inline so Tailwind utilities (`text-clinic-500`, etc.)
 * inherit the brand color in every section — not only where `--clinic-primary` is read.
 */
export function clinicPrimaryColorStyle(
    primaryColor: string | null | undefined,
): ClinicBrandCssVars {
    const raw = primaryColor?.trim() || CLINIC_DEFAULT_PRIMARY_COLOR;
    const withHash = raw.startsWith('#') ? raw : `#${raw}`;
    const rgb = parseHexColor(withHash);
    const primary = rgb ? toHex(rgb) : CLINIC_DEFAULT_PRIMARY_COLOR;
    const base = rgb ?? parseHexColor(CLINIC_DEFAULT_PRIMARY_COLOR)!;

    return {
        '--clinic-primary': primary,
        '--color-clinic-50': mix(base, WHITE, 0.92),
        '--color-clinic-100': mix(base, WHITE, 0.82),
        '--color-clinic-200': mix(base, WHITE, 0.68),
        '--color-clinic-300': mix(base, WHITE, 0.52),
        '--color-clinic-400': mix(base, WHITE, 0.28),
        '--color-clinic-500': primary,
        '--color-clinic-600': mix(base, BLACK, 0.18),
        '--color-clinic-700': mix(base, BLACK, 0.32),
        '--color-clinic-800': mix(base, BLACK, 0.48),
        '--color-clinic-900': mix(base, BLACK, 0.62),
    };
}
