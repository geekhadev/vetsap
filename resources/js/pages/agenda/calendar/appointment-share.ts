import { format } from 'date-fns';
import type { AppointmentDetail } from '@/pages/agenda/calendar/types';

export function toWhatsappPhoneDigits(phone: string): string | null {
    const digits = phone.replace(/\D/g, '');

    if (digits === '') {
        return null;
    }

    if (digits.startsWith('56') && digits.length >= 11) {
        return digits;
    }

    const local = digits.slice(-9);

    if (local.length === 9) {
        return `56${local}`;
    }

    return digits.length >= 8 ? digits : null;
}

export function buildAppointmentReminderMessage(
    appointment: AppointmentDetail,
    companyName: string,
): string {
    const startsAt = new Date(appointment.starts_at);
    const dateTime = Number.isNaN(startsAt.getTime())
        ? appointment.starts_at
        : format(startsAt, "dd/MM/yyyy 'a las' HH:mm");

    return `Hola ${appointment.customer.name}, le saludamos de ${companyName} para recordarle que el día ${dateTime} tiene una cita para ${appointment.service.name} con su mascota ${appointment.patient.name}.`;
}

export function buildAppointmentWhatsappUrl(
    appointment: AppointmentDetail,
    companyName: string,
): string | null {
    const phone = toWhatsappPhoneDigits(appointment.customer.phone);

    if (phone === null) {
        return null;
    }

    const message = buildAppointmentReminderMessage(appointment, companyName);

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
