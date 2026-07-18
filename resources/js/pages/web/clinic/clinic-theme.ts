/** Default clinic brand color (Tailwind cyan-500). */
export const CLINIC_DEFAULT_PRIMARY_COLOR = '#06B6D4';

export function clinicPrimaryColorStyle(
    primaryColor: string | null | undefined,
): Record<'--clinic-primary', string> | undefined {
    if (primaryColor == null || primaryColor.trim() === '') {
        return undefined;
    }

    return {
        '--clinic-primary': primaryColor.trim(),
    };
}
