/** Chile mainland timezone for public clinic booking calendar exports. */
const BOOKING_TIMEZONE = 'America/Santiago';

export type BookingCalendarEvent = {
    title: string;
    description: string;
    location: string | null;
    date: string;
    startTime: string;
    endTime: string;
};

function pad2(value: number): string {
    return String(value).padStart(2, '0');
}

/** Formats `YYYY-MM-DD` + `HH:mm` as Google/ICS local stamp `YYYYMMDDTHHmmss`. */
function toLocalCalendarStamp(date: string, time: string): string {
    const [hours = '00', minutes = '00'] = time.split(':');

    return `${date.replace(/-/g, '')}T${hours.padStart(2, '0')}${minutes.padStart(2, '0')}00`;
}

function escapeIcsText(value: string): string {
    return value
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\r?\n/g, '\\n');
}

function buildIcsUid(event: BookingCalendarEvent): string {
    const stamp = toLocalCalendarStamp(event.date, event.startTime);
    const slug = event.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 40);

    return `${stamp}-${slug || 'cita'}@vetsap.cl`;
}

export function buildGoogleCalendarUrl(event: BookingCalendarEvent): string {
    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: event.title,
        dates: `${toLocalCalendarStamp(event.date, event.startTime)}/${toLocalCalendarStamp(event.date, event.endTime)}`,
        details: event.description,
        ctz: BOOKING_TIMEZONE,
    });

    if (event.location) {
        params.set('location', event.location);
    }

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildIcsContent(event: BookingCalendarEvent): string {
    const now = new Date();
    const stamp = [
        now.getUTCFullYear(),
        pad2(now.getUTCMonth() + 1),
        pad2(now.getUTCDate()),
        'T',
        pad2(now.getUTCHours()),
        pad2(now.getUTCMinutes()),
        pad2(now.getUTCSeconds()),
        'Z',
    ].join('');

    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Vetsap//Clinic Booking//ES',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${buildIcsUid(event)}`,
        `DTSTAMP:${stamp}`,
        `DTSTART;TZID=${BOOKING_TIMEZONE}:${toLocalCalendarStamp(event.date, event.startTime)}`,
        `DTEND;TZID=${BOOKING_TIMEZONE}:${toLocalCalendarStamp(event.date, event.endTime)}`,
        `SUMMARY:${escapeIcsText(event.title)}`,
        `DESCRIPTION:${escapeIcsText(event.description)}`,
    ];

    if (event.location) {
        lines.push(`LOCATION:${escapeIcsText(event.location)}`);
    }

    lines.push('END:VEVENT', 'END:VCALENDAR');

    return `${lines.join('\r\n')}\r\n`;
}

export function downloadIcsFile(event: BookingCalendarEvent, filename = 'cita-veterinaria.ics'): void {
    const blob = new Blob([buildIcsContent(event)], {
        type: 'text/calendar;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

export function buildBookingCalendarEvent(input: {
    companyName: string;
    serviceName: string;
    petName: string;
    veterinarianName: string | undefined;
    companyAddress: string | null;
    date: string;
    startTime: string;
    endTime: string;
}): BookingCalendarEvent {
    const doctorLine = input.veterinarianName
        ? `Médico: ${input.veterinarianName}.`
        : '';

    return {
        title: `${input.serviceName} — ${input.petName} | ${input.companyName}`,
        description: [
            `Cita veterinaria en ${input.companyName}.`,
            `Servicio: ${input.serviceName}.`,
            `Mascota: ${input.petName}.`,
            doctorLine,
        ]
            .filter((line) => line !== '')
            .join('\n'),
        location: input.companyAddress,
        date: input.date,
        startTime: input.startTime,
        endTime: input.endTime,
    };
}
