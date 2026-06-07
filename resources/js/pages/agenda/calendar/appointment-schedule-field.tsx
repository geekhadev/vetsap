import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormDateTimePickerField } from '@/components/custom/form-datetime-picker-field';
import { CALENDAR_SLOT_DURATION_MINUTES } from '@/components/custom/full-calendar/config';
import type { CalendarHoliday } from '@/components/custom/full-calendar/types';
import { cn } from '@/lib/utils';
import {
    buildAppointmentDateDisabledMatcher,
    resolveAppointmentScheduleFieldError,
    validateAppointmentScheduleSelection,
} from '@/pages/agenda/calendar/schedule-availability';
import {
    appointmentScheduleValuesEqual,
    parseAppointmentScheduleValue,
} from '@/pages/agenda/calendar/types';
import type {
    AppointmentDoctorScheduleWindow,
    AppointmentScheduleValue,
} from '@/pages/agenda/calendar/types';

export type AppointmentScheduleFieldProps = {
    value: AppointmentScheduleValue;
    onChange: (value: AppointmentScheduleValue) => void;
    durationMinutes: number | null;
    doctorScheduleWindows: AppointmentDoctorScheduleWindow[];
    holidays: CalendarHoliday[];
    disabled?: boolean;
    error?: string | null;
    id?: string;
    required?: boolean;
    triggerClassName?: string;
    validateSelection?: boolean;
};

export function AppointmentScheduleField({
    value,
    onChange,
    durationMinutes,
    doctorScheduleWindows,
    holidays,
    disabled = false,
    error = null,
    id = 'appointment-scheduled-at',
    required = false,
    triggerClassName,
    validateSelection = true,
}: AppointmentScheduleFieldProps) {
    const [localError, setLocalError] = useState<string | null>(null);

    const isDateDisabled = useMemo(
        () =>
            buildAppointmentDateDisabledMatcher(
                doctorScheduleWindows,
                holidays,
            ),
        [doctorScheduleWindows, holidays],
    );

    const validate = useCallback(
        (schedule: AppointmentScheduleValue): string | null => {
            if (!validateSelection) {
                return null;
            }

            if (durationMinutes === null || durationMinutes <= 0) {
                return 'Selecciona un servicio con duración configurada.';
            }

            return validateAppointmentScheduleSelection(
                schedule,
                durationMinutes,
                doctorScheduleWindows,
                holidays,
            );
        },
        [
            validateSelection,
            durationMinutes,
            doctorScheduleWindows,
            holidays,
        ],
    );

    const handleChange = useCallback(
        ({ date, time }: { date: string; time: string }) => {
            const nextSchedule: AppointmentScheduleValue = {
                appointmentDate: date,
                startsAtTime: time,
            };

            setLocalError(null);
            onChange(nextSchedule);

            if (validateSelection) {
                setLocalError(validate(nextSchedule));
            }
        },
        [onChange, validate, validateSelection],
    );

    const displayError = resolveAppointmentScheduleFieldError(
        error,
        localError,
    );

    return (
        <FormDateTimePickerField
            label="Fecha y hora"
            required={required}
            value={{
                date: value.appointmentDate,
                time: value.startsAtTime,
            }}
            onChange={handleChange}
            minuteStep={CALENDAR_SLOT_DURATION_MINUTES}
            error={displayError}
            id={id}
            disabled={disabled ? () => true : isDateDisabled}
            popoverContentClassName="z-[100]"
            triggerClassName={triggerClassName}
        />
    );
}

type AppointmentScheduleAutosaveFieldProps = {
    startsAt: string;
    durationMinutes: number;
    doctorScheduleWindows: AppointmentDoctorScheduleWindow[];
    holidays: CalendarHoliday[];
    canUpdate: boolean;
    saving: boolean;
    error: string | null;
    onCommit: (schedule: AppointmentScheduleValue) => void;
};

export function AppointmentScheduleAutosaveField({
    startsAt,
    durationMinutes,
    doctorScheduleWindows,
    holidays,
    canUpdate,
    saving,
    error,
    onCommit,
}: AppointmentScheduleAutosaveFieldProps) {
    const savedSchedule = useMemo(
        () => parseAppointmentScheduleValue(startsAt),
        [startsAt],
    );
    const [schedule, setSchedule] = useState(savedSchedule);
    const [commitError, setCommitError] = useState<string | null>(null);

    const handleCommit = useCallback(
        (nextSchedule: AppointmentScheduleValue) => {
            const validationError = validateAppointmentScheduleSelection(
                nextSchedule,
                durationMinutes,
                doctorScheduleWindows,
                holidays,
            );

            if (validationError !== null) {
                setCommitError(validationError);

                return;
            }

            setCommitError(null);
            onCommit(nextSchedule);
        },
        [durationMinutes, doctorScheduleWindows, holidays, onCommit],
    );

    useEffect(() => {
        if (
            !canUpdate ||
            saving ||
            appointmentScheduleValuesEqual(schedule, savedSchedule)
        ) {
            return;
        }

        const timer = window.setTimeout(() => {
            handleCommit(schedule);
        }, 500);

        return () => {
            window.clearTimeout(timer);
        };
    }, [canUpdate, saving, handleCommit, savedSchedule, schedule]);

    const isInteractive = canUpdate && !saving;
    const displayError = resolveAppointmentScheduleFieldError(
        error,
        commitError,
    );

    return (
        <AppointmentScheduleField
            value={schedule}
            onChange={(nextSchedule) => {
                setCommitError(null);
                setSchedule(nextSchedule);
            }}
            durationMinutes={durationMinutes}
            doctorScheduleWindows={doctorScheduleWindows}
            holidays={holidays}
            disabled={!isInteractive}
            error={displayError ?? null}
            id="appointment-detail-scheduled-at"
            validateSelection={false}
            triggerClassName={cn(
                saving && 'pointer-events-none opacity-80',
            )}
        />
    );
}
