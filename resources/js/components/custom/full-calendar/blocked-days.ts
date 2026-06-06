import { isCalendarHolidayDate, toCalendarDateKey } from './holidays';
import type { CalendarHoliday } from './types';

export const BLOCKED_DAY_REASON_ATTRIBUTE = 'data-blocked-day-reason';

/** ISO: 1=lunes … 7=domingo (alineado al backend). */
export function toIsoDayOfWeek(date: Date): number {
    const day = date.getDay();

    return day === 0 ? 7 : day;
}

export function buildScheduledDaysOfWeekSet(
    scheduledDaysOfWeek: number[],
): Set<number> {
    return new Set(scheduledDaysOfWeek);
}

export function isCalendarUnscheduledDate(
    date: Date,
    scheduledDaysOfWeek: Set<number>,
): boolean {
    if (scheduledDaysOfWeek.size === 0) {
        return true;
    }

    return !scheduledDaysOfWeek.has(toIsoDayOfWeek(date));
}

export function isCalendarBlockedDate(
    date: Date,
    holidayDates: Set<string>,
    scheduledDaysOfWeek: Set<number>,
): boolean {
    return (
        isCalendarHolidayDate(date, holidayDates) ||
        isCalendarUnscheduledDate(date, scheduledDaysOfWeek)
    );
}

const ISO_TO_FC_DAY_MODIFIER: Record<number, string> = {
    1: 'blocks-dow-mon',
    2: 'blocks-dow-tue',
    3: 'blocks-dow-wed',
    4: 'blocks-dow-thu',
    5: 'blocks-dow-fri',
    6: 'blocks-dow-sat',
    7: 'blocks-dow-sun',
};

/** Clases raíz para teñir columnas/celdas de días sin horario configurado. */
export function buildUnscheduledDayRootClasses(
    scheduledDaysOfWeek: Set<number>,
): string[] {
    const classes: string[] = [];

    for (let day = 1; day <= 7; day += 1) {
        if (!scheduledDaysOfWeek.has(day)) {
            classes.push(ISO_TO_FC_DAY_MODIFIER[day]);
        }
    }

    return classes;
}

export function resolveBlockedDayReason(
    date: Date,
    holidaysByDate: Map<string, CalendarHoliday>,
    scheduledDaysOfWeek: Set<number>,
): string | null {
    const holiday = holidaysByDate.get(toCalendarDateKey(date));

    if (holiday) {
        return `Día feriado: ${holiday.name}`;
    }

    if (isCalendarUnscheduledDate(date, scheduledDaysOfWeek)) {
        return 'Sin horario: ningún doctor tiene agenda este día';
    }

    return null;
}

export function applyBlockedDayReason(
    element: HTMLElement,
    reason: string | null,
): void {
    if (reason) {
        element.setAttribute(BLOCKED_DAY_REASON_ATTRIBUTE, reason);

        return;
    }

    element.removeAttribute(BLOCKED_DAY_REASON_ATTRIBUTE);
}

export function annotateBlockedCalendarElements(
    root: HTMLElement,
    holidaysByDate: Map<string, CalendarHoliday>,
    scheduledDaysOfWeek: Set<number>,
): void {
    root.querySelectorAll<HTMLElement>('[data-date]').forEach((element) => {
        const dateKey = element.getAttribute('data-date');

        if (!dateKey) {
            return;
        }

        const reason = resolveBlockedDayReason(
            new Date(`${dateKey}T12:00:00`),
            holidaysByDate,
            scheduledDaysOfWeek,
        );

        applyBlockedDayReason(element, reason);
    });
}
