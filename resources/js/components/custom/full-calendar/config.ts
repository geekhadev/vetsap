import type { CalendarViewId } from './types';

/** Tailwind `md` breakpoint: below this, calendar opens in list view. */
export const CALENDAR_MOBILE_MAX_WIDTH_QUERY = '(max-width: 767px)';

export function resolveDefaultCalendarView(): CalendarViewId {
    if (typeof window === 'undefined') {
        return 'threeDay';
    }

    return window.matchMedia(CALENDAR_MOBILE_MAX_WIDTH_QUERY).matches
        ? 'listWeek'
        : 'threeDay';
}

/** Duración base de cada bloque horario del calendario. */
export const CALENDAR_SLOT_DURATION_MINUTES = 30;

export const CALENDAR_SLOT_DURATION = '00:30:00' as const;

export const CALENDAR_SLOT_LABEL_INTERVAL = '01:00:00' as const;

export const CALENDAR_DEFAULT_EVENT_DURATION = '00:30:00' as const;

export const CALENDAR_SNAP_DURATION = '00:30:00' as const;

export const CALENDAR_SLOT_MIN_TIME = '08:00:00' as const;

export const CALENDAR_SLOT_MAX_TIME = '20:00:00' as const;

/** Altura visual de cada bloque de 30 min en la rejilla horaria. */
export const CALENDAR_SLOT_HEIGHT = '3rem' as const;

export const CALENDAR_TIMEGRID_VIEW_OPTIONS = {
    slotDuration: CALENDAR_SLOT_DURATION,
    slotLabelInterval: CALENDAR_SLOT_LABEL_INTERVAL,
    snapDuration: CALENDAR_SNAP_DURATION,
    slotMinTime: CALENDAR_SLOT_MIN_TIME,
    slotMaxTime: CALENDAR_SLOT_MAX_TIME,
} as const;

export const CALENDAR_SLOT_LABEL_FORMAT = {
    hour: 'numeric',
    hour12: false,
} as const;

/** Minutos antes de la hora actual para posicionar el scroll inicial. */
export const CALENDAR_SCROLL_OFFSET_MINUTES = 60;

function parseTimeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);

    return hours * 60 + minutes;
}

function formatMinutesAsTime(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
}

/** Hora de scroll para centrar la vista en el indicador de “ahora”. */
export function resolveCalendarScrollTime(
    referenceDate: Date = new Date(),
    offsetMinutes: number = CALENDAR_SCROLL_OFFSET_MINUTES,
): string {
    const minMinutes = parseTimeToMinutes(CALENDAR_SLOT_MIN_TIME);
    const maxMinutes = parseTimeToMinutes(CALENDAR_SLOT_MAX_TIME);
    const referenceMinutes =
        referenceDate.getHours() * 60 + referenceDate.getMinutes() - offsetMinutes;

    const clampedMinutes = Math.max(
        minMinutes,
        Math.min(maxMinutes - CALENDAR_SLOT_DURATION_MINUTES, referenceMinutes),
    );

    return formatMinutesAsTime(clampedMinutes);
}

export function isTimeGridView(viewType: string): boolean {
    return viewType.includes('timeGrid') || viewType === 'threeDay';
}

export function viewIncludesToday(activeStart: Date, activeEnd: Date): boolean {
    const now = new Date();

    return now >= activeStart && now < activeEnd;
}

export type CalendarSlotDefaults = {
    appointmentDate: string;
    startsAtTime: string;
};

function formatCalendarDate(date: Date): string {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
    ].join('-');
}

function formatCalendarTime(hours: number, minutes: number): string {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function isSameCalendarDay(first: Date, second: Date): boolean {
    return (
        first.getFullYear() === second.getFullYear() &&
        first.getMonth() === second.getMonth() &&
        first.getDate() === second.getDate()
    );
}

function roundMinutesToSlot(totalMinutes: number): number {
    return (
        Math.round(totalMinutes / CALENDAR_SLOT_DURATION_MINUTES) *
        CALENDAR_SLOT_DURATION_MINUTES
    );
}

/** Convierte un click en el calendario en valores por defecto para el formulario de cita. */
export function buildSlotDefaultsFromDate(
    date: Date,
    referenceDate: Date = new Date(),
): CalendarSlotDefaults {
    const appointmentDate = formatCalendarDate(date);

    let hours = date.getHours();
    let minutes = date.getMinutes();

    if (hours === 0 && minutes === 0) {
        if (isSameCalendarDay(date, referenceDate)) {
            const totalMinutes =
                referenceDate.getHours() * 60 + referenceDate.getMinutes();
            const roundedMinutes = roundMinutesToSlot(totalMinutes);

            hours = Math.floor(roundedMinutes / 60) % 24;
            minutes = roundedMinutes % 60;
        } else {
            [hours, minutes] = CALENDAR_SLOT_MIN_TIME.split(':').map(Number);
        }
    } else {
        const roundedMinutes = roundMinutesToSlot(hours * 60 + minutes);

        hours = Math.floor(roundedMinutes / 60) % 24;
        minutes = roundedMinutes % 60;
    }

    return {
        appointmentDate,
        startsAtTime: formatCalendarTime(hours, minutes),
    };
}
