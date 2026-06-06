import type { CalendarHoliday } from './types';

/** Convierte un `Date` a clave `YYYY-MM-DD` en hora local. */
export function toCalendarDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

/** Día siguiente en formato `YYYY-MM-DD` (fin exclusivo de FullCalendar). */
export function nextCalendarDateKey(dateKey: string): string {
    const date = new Date(`${dateKey}T12:00:00`);

    date.setDate(date.getDate() + 1);

    return toCalendarDateKey(date);
}

export function buildHolidayDateSet(holidays: CalendarHoliday[]): Set<string> {
    return new Set(holidays.map((holiday) => holiday.date));
}

export function buildHolidayByDateMap(
    holidays: CalendarHoliday[],
): Map<string, CalendarHoliday> {
    return new Map(holidays.map((holiday) => [holiday.date, holiday]));
}

export function eventStartsOnHoliday(
    start: string,
    holidayDates: Set<string>,
): boolean {
    return isCalendarHolidayDate(new Date(start), holidayDates);
}

export function filterEventsExcludingHolidays<T extends { start: string }>(
    events: T[],
    holidayDates: Set<string>,
): T[] {
    return events.filter(
        (event) => !eventStartsOnHoliday(event.start, holidayDates),
    );
}

export function buildHolidayBackgroundEvents(holidays: CalendarHoliday[]) {
    return holidays.map((holiday) => ({
        id: `holiday-${holiday.id}`,
        title: holiday.name,
        start: holiday.date,
        end: nextCalendarDateKey(holiday.date),
        display: 'background' as const,
        classNames: ['holiday-blocked'],
        extendedProps: {
            holidayName: holiday.name,
            isHoliday: true,
        },
        overlap: false,
    }));
}

export function isCalendarHolidayDate(
    date: Date,
    holidayDates: Set<string>,
): boolean {
    return holidayDates.has(toCalendarDateKey(date));
}
