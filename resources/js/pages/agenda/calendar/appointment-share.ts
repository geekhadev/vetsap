import { format } from 'date-fns';
import type { AppointmentDetail } from '@/pages/agenda/calendar/types';

export type MapCoordinates = {
    lat: number;
    lng: number;
};

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

function isValidCoordinate(lat: number, lng: number): boolean {
    return (
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
    );
}

/**
 * Extrae lat/lng desde un src de iframe de Google Maps (u otras URLs comunes).
 * Prioriza el pin del lugar (!3d!4d) frente al centro del mapa (!2d!3d).
 */
export function extractCoordinatesFromMapUrl(
    mapUrl: string,
): MapCoordinates | null {
    const decoded = (() => {
        try {
            return decodeURIComponent(mapUrl);
        } catch {
            return mapUrl;
        }
    })();

    const placePin = decoded.match(
        /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
    );

    if (placePin) {
        const lat = Number(placePin[1]);
        const lng = Number(placePin[2]);

        if (isValidCoordinate(lat, lng)) {
            return { lat, lng };
        }
    }

    const mapCenter = decoded.match(
        /!2d(-?\d+(?:\.\d+)?)!3d(-?\d+(?:\.\d+)?)/,
    );

    if (mapCenter) {
        const lng = Number(mapCenter[1]);
        const lat = Number(mapCenter[2]);

        if (isValidCoordinate(lat, lng)) {
            return { lat, lng };
        }
    }

    const atCoords = decoded.match(
        /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    );

    if (atCoords) {
        const lat = Number(atCoords[1]);
        const lng = Number(atCoords[2]);

        if (isValidCoordinate(lat, lng)) {
            return { lat, lng };
        }
    }

    try {
        const url = new URL(mapUrl);
        const query =
            url.searchParams.get('q') ??
            url.searchParams.get('ll') ??
            url.searchParams.get('query') ??
            '';
        const queryCoords = query.match(
            /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/,
        );

        if (queryCoords) {
            const lat = Number(queryCoords[1]);
            const lng = Number(queryCoords[2]);

            if (isValidCoordinate(lat, lng)) {
                return { lat, lng };
            }
        }
    } catch {
        // URL inválida: no hay coordenadas que extraer.
    }

    return null;
}

export function buildGoogleMapsUrlFromCoordinates(
    coordinates: MapCoordinates,
): string {
    return `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
}

export function buildWazeUrlFromCoordinates(
    coordinates: MapCoordinates,
): string {
    return `https://waze.com/ul?ll=${coordinates.lat},${coordinates.lng}&navigate=yes`;
}

export function buildClinicNavigationLinks(
    clinicMapUrl: string,
): { googleMaps: string; waze: string } | null {
    const coordinates = extractCoordinatesFromMapUrl(clinicMapUrl);

    if (coordinates === null) {
        return null;
    }

    return {
        googleMaps: buildGoogleMapsUrlFromCoordinates(coordinates),
        waze: buildWazeUrlFromCoordinates(coordinates),
    };
}

export function buildAppointmentReminderMessage(
    appointment: AppointmentDetail,
    companyName: string,
): string {
    const startsAt = new Date(appointment.starts_at);
    const dateTime = Number.isNaN(startsAt.getTime())
        ? appointment.starts_at
        : format(startsAt, "dd/MM/yyyy 'a las' HH:mm");

    let message = `Hola ${appointment.customer.name}, le saludamos de ${companyName} para recordarle que el día ${dateTime} tiene una cita para ${appointment.service.name} con su mascota ${appointment.patient.name}.`;

    const clinicMapUrl = appointment.clinic_map_url?.trim() ?? '';

    if (clinicMapUrl !== '') {
        const links = buildClinicNavigationLinks(clinicMapUrl);

        if (links !== null) {
            message += `\n\n\nPara que no se pierda, puede ubicar la clínica aquí:\n\nGoogle Maps: ${links.googleMaps}\n\nWaze: ${links.waze}`;
        }
    }

    const socialLines: string[] = [];
    const facebookUrl = appointment.clinic_facebook_url?.trim() ?? '';
    const instagramUrl = appointment.clinic_instagram_url?.trim() ?? '';

    if (facebookUrl !== '') {
        socialLines.push(`Facebook: ${facebookUrl}`);
    }

    if (instagramUrl !== '') {
        socialLines.push(`Instagram: ${instagramUrl}`);
    }

    if (socialLines.length > 0) {
        message += `\n\n\nTambién lo invitamos a visitarnos y seguirnos en nuestras redes sociales:\n\n${socialLines.join('\n\n')}`;
    }

    return message;
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
