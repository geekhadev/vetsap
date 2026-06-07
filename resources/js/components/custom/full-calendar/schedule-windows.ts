import { addMinutes } from 'date-fns';
import { toIsoDayOfWeek } from './blocked-days';
import {
    CALENDAR_SLOT_DURATION_MINUTES,
    CALENDAR_SLOT_MAX_TIME,
    CALENDAR_SLOT_MIN_TIME,
} from './config';
import { isCalendarHolidayDate, toCalendarDateKey } from './holidays';
import type { CalendarScheduleWindow } from './types';

export const SCHEDULE_BLOCKED_REASON = 'Fuera del horario de atención';

type MinuteInterval = {
    start: number;
    end: number;
};

function parseTimeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);

    return hours * 60 + minutes;
}

function formatMinutesAsIsoTime(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
}

function normalizeScheduleTime(time: string): string {
    return time.slice(0, 5);
}

function mergeMinuteIntervals(intervals: MinuteInterval[]): MinuteInterval[] {
    if (intervals.length === 0) {
        return [];
    }

    const sorted = [...intervals].sort((first, second) => first.start - second.start);
    const merged: MinuteInterval[] = [sorted[0]];

    for (let index = 1; index < sorted.length; index += 1) {
        const current = sorted[index];
        const last = merged[merged.length - 1];

        if (current.start <= last.end) {
            last.end = Math.max(last.end, current.end);
        } else {
            merged.push(current);
        }
    }

    return merged;
}

function getMergedWindowsForDay(
    dayOfWeek: number,
    scheduleWindows: CalendarScheduleWindow[],
): MinuteInterval[] {
    const calendarStart = parseTimeToMinutes(CALENDAR_SLOT_MIN_TIME);
    const calendarEnd = parseTimeToMinutes(CALENDAR_SLOT_MAX_TIME);

    const dayIntervals = scheduleWindows
        .filter((window) => window.dayOfWeek === dayOfWeek)
        .map((window) => ({
            start: Math.max(
                calendarStart,
                parseTimeToMinutes(normalizeScheduleTime(window.startsAt)),
            ),
            end: Math.min(
                calendarEnd,
                parseTimeToMinutes(normalizeScheduleTime(window.endsAt)),
            ),
        }))
        .filter((interval) => interval.start < interval.end);

    return mergeMinuteIntervals(dayIntervals);
}

function getUnavailableRangesForDay(
    dayOfWeek: number,
    scheduleWindows: CalendarScheduleWindow[],
): MinuteInterval[] {
    const calendarStart = parseTimeToMinutes(CALENDAR_SLOT_MIN_TIME);
    const calendarEnd = parseTimeToMinutes(CALENDAR_SLOT_MAX_TIME);
    const available = getMergedWindowsForDay(dayOfWeek, scheduleWindows);

    if (available.length === 0) {
        return [{ start: calendarStart, end: calendarEnd }];
    }

    const unavailable: MinuteInterval[] = [];
    let cursor = calendarStart;

    available.forEach((window) => {
        if (cursor < window.start) {
            unavailable.push({ start: cursor, end: window.start });
        }

        cursor = Math.max(cursor, window.end);
    });

    if (cursor < calendarEnd) {
        unavailable.push({ start: cursor, end: calendarEnd });
    }

    return unavailable;
}

export function isDateTimeWithinSchedule(
    date: Date,
    scheduleWindows: CalendarScheduleWindow[],
    scheduledDaysOfWeek: Set<number>,
    holidayDates: Set<string>,
): boolean {
    if (isCalendarHolidayDate(date, holidayDates)) {
        return false;
    }

    const dayOfWeek = toIsoDayOfWeek(date);

    if (!scheduledDaysOfWeek.has(dayOfWeek)) {
        return false;
    }

    const mergedWindows = getMergedWindowsForDay(dayOfWeek, scheduleWindows);

    if (mergedWindows.length === 0) {
        return false;
    }

    const slotStartMinutes = date.getHours() * 60 + date.getMinutes();
    const roundedStart =
        Math.floor(slotStartMinutes / CALENDAR_SLOT_DURATION_MINUTES) *
        CALENDAR_SLOT_DURATION_MINUTES;

    return mergedWindows.some(
        (window) => roundedStart >= window.start && roundedStart < window.end,
    );
}

export function isAppointmentWithinSchedule(
    startDate: Date,
    durationMinutes: number,
    scheduleWindows: CalendarScheduleWindow[],
    scheduledDaysOfWeek: Set<number>,
    holidayDates: Set<string>,
): boolean {
    if (isCalendarHolidayDate(startDate, holidayDates)) {
        return false;
    }

    const dayOfWeek = toIsoDayOfWeek(startDate);

    if (!scheduledDaysOfWeek.has(dayOfWeek)) {
        return false;
    }

    const mergedWindows = getMergedWindowsForDay(dayOfWeek, scheduleWindows);

    if (mergedWindows.length === 0) {
        return false;
    }

    const endDate = addMinutes(startDate, durationMinutes);

    if (toCalendarDateKey(endDate) !== toCalendarDateKey(startDate)) {
        return false;
    }

    const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
    const endMinutes = endDate.getHours() * 60 + endDate.getMinutes();
    const roundedStart =
        Math.floor(startMinutes / CALENDAR_SLOT_DURATION_MINUTES) *
        CALENDAR_SLOT_DURATION_MINUTES;

    return mergedWindows.some(
        (window) => roundedStart >= window.start && endMinutes <= window.end,
    );
}

export function buildUnavailableScheduleBackgroundEvents(
    scheduleWindows: CalendarScheduleWindow[],
    holidayDates: Set<string>,
    scheduledDaysOfWeek: Set<number>,
    rangeStart: Date,
    rangeEnd: Date,
) {
    const events = [];
    const cursor = new Date(rangeStart);
    cursor.setHours(12, 0, 0, 0);

    const end = new Date(rangeEnd);
    end.setHours(12, 0, 0, 0);

    while (cursor < end) {
        const dateKey = toCalendarDateKey(cursor);

        if (!isCalendarHolidayDate(cursor, holidayDates)) {
            const dayOfWeek = toIsoDayOfWeek(cursor);

            if (scheduledDaysOfWeek.has(dayOfWeek)) {
                const unavailableRanges = getUnavailableRangesForDay(
                    dayOfWeek,
                    scheduleWindows,
                );

                unavailableRanges.forEach((range, index) => {
                    events.push({
                        id: `schedule-blocked-${dateKey}-${index}`,
                        start: `${dateKey}T${formatMinutesAsIsoTime(range.start)}`,
                        end: `${dateKey}T${formatMinutesAsIsoTime(range.end)}`,
                        display: 'background' as const,
                        classNames: ['schedule-blocked'],
                        overlap: false as const,
                        extendedProps: {
                            isScheduleBlocked: true,
                            blockedReason: SCHEDULE_BLOCKED_REASON,
                        },
                    });
                });
            }
        }

        cursor.setDate(cursor.getDate() + 1);
    }

    return events;
}

export function mapScheduleWindowsFromPayload(
    windows: Array<{ day_of_week: number; starts_at: string; ends_at: string }>,
): CalendarScheduleWindow[] {
    return windows.map((window) => ({
        dayOfWeek: window.day_of_week,
        startsAt: window.starts_at,
        endsAt: window.ends_at,
    }));
}
