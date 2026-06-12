export const vetsapAppConfig = {
    whatsapp: {
        phone: '56937263654',
        message: 'Hola, estoy interesado en Vetsap',
    },
} as const;

export function buildVetsapWhatsappUrl(
    message: string = vetsapAppConfig.whatsapp.message,
): string {
    return `https://wa.me/${vetsapAppConfig.whatsapp.phone}?text=${encodeURIComponent(message)}`;
}
