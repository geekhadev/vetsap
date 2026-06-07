import { isBefore, startOfDay } from 'date-fns';
import { toIsoDayOfWeek } from '@/components/custom/full-calendar/blocked-days';
import {
    buildHolidayDateSet,
    isCalendarHolidayDate,
} from '@/components/custom/full-calendar/holidays';
import { isAppointmentWithinSchedule } from '@/components/custom/full-calendar/schedule-windows';
import type { CalendarHoliday } from '@/components/custom/full-calendar/types';
import type {
    AppointmentDoctorScheduleWindow,
    AppointmentScheduleValue,
} from '@/pages/agenda/calendar/types';

function mapDoctorScheduleWindows(
    windows: AppointmentDoctorScheduleWindow[],
) {
    return windows.map((window) => ({
        dayOfWeek: window.day_of_week,
        startsAt: window.starts_at,
        endsAt: window.ends_at,
    }));
}

function buildDoctorScheduledDays(
    windows: AppointmentDoctorScheduleWindow[],
): Set<number> {
    return new Set(windows.map((window) => window.day_of_week));
}

export function buildAppointmentDateDisabledMatcher(
    doctorScheduleWindows: AppointmentDoctorScheduleWindow[],
    holidays: CalendarHoliday[],
) {
    const holidayDates = buildHolidayDateSet(holidays);
    const scheduledDays = buildDoctorScheduledDays(doctorScheduleWindows);
    const hasDoctorSchedule = doctorScheduleWindows.length > 0;

    return (date: Date): boolean => {
        if (isBefore(startOfDay(date), startOfDay(new Date()))) {
            return true;
        }

        if (isCalendarHolidayDate(date, holidayDates)) {
            return true;
        }

        if (hasDoctorSchedule && !scheduledDays.has(toIsoDayOfWeek(date))) {
            return true;
        }

        return false;
    };
}

export function validateAppointmentScheduleSelection(
    schedule: AppointmentScheduleValue,
    durationMinutes: number,
    doctorScheduleWindows: AppointmentDoctorScheduleWindow[],
    holidays: CalendarHoliday[],
): string | null {
    const { appointmentDate, startsAtTime } = schedule;

    if (appointmentDate.trim() === '' || startsAtTime.trim() === '') {
        return 'Selecciona fecha y hora.';
    }

    const start = new Date(`${appointmentDate}T${startsAtTime}:00`);

    if (Number.isNaN(start.getTime())) {
        return 'Fecha u hora no válida.';
    }

    if (isBefore(start, new Date())) {
        return 'No se puede agendar en una fecha u hora pasada.';
    }

    const holidayDates = buildHolidayDateSet(holidays);

    if (isCalendarHolidayDate(start, holidayDates)) {
        return 'No se pueden agendar citas en un día feriado.';
    }

    if (doctorScheduleWindows.length === 0) {
        return 'Selecciona un doctor para validar el horario.';
    }

    const scheduledDays = buildDoctorScheduledDays(doctorScheduleWindows);

    if (!scheduledDays.has(toIsoDayOfWeek(start))) {
        return 'El doctor no tiene agenda configurada para ese día.';
    }

    const scheduleWindows = mapDoctorScheduleWindows(doctorScheduleWindows);

    if (
        !isAppointmentWithinSchedule(
            start,
            durationMinutes,
            scheduleWindows,
            scheduledDays,
            holidayDates,
        )
    ) {
        return 'Fecha no disponible.';
    }

    return null;
}

export function resolveAppointmentScheduleFieldError(
    serverError: string | null | undefined,
    localError: string | null,
): string | undefined {
    const trimmedServer = serverError?.trim() ?? '';

    if (trimmedServer !== '') {
        return trimmedServer;
    }

    const trimmedLocal = localError?.trim() ?? '';

    return trimmedLocal !== '' ? trimmedLocal : undefined;
}

export function resolveHttpValidationMessage(
    error: unknown,
    fields: string[],
    fallback: string,
): string {
    if (typeof error !== 'object' || error === null || !('errors' in error)) {
        return fallback;
    }

    const errors = (error as { errors: unknown }).errors;

    if (typeof errors !== 'object' || errors === null) {
        return fallback;
    }

    for (const field of fields) {
        const value = (errors as Record<string, unknown>)[field];

        if (Array.isArray(value) && typeof value[0] === 'string') {
            return value[0];
        }

        if (typeof value === 'string' && value !== '') {
            return value;
        }
    }

    return fallback;
}
