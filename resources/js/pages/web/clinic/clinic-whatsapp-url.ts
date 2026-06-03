import type { ClinicSettings } from './types';

const DEFAULT_WHATSAPP_MESSAGE = 'Hola, me gustaría agendar una cita.';

export function buildClinicWhatsappUrl(settings: ClinicSettings): string | null {
    const number = settings['whatsapp_phone'];

    if (!number) {
        return null;
    }

    const message = settings['whatsapp_message'] ?? DEFAULT_WHATSAPP_MESSAGE;

    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
