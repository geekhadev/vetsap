export const APPOINTMENT_STATUS_COLORS = [
    'slate',
    'blue',
    'sky',
    'cyan',
    'teal',
    'green',
    'emerald',
    'lime',
    'amber',
    'orange',
    'rose',
    'pink',
    'purple',
    'violet',
    'indigo',
    'red',
] as const;

export type AppointmentStatusColorValue =
    (typeof APPOINTMENT_STATUS_COLORS)[number];

export const APPOINTMENT_STATUS_COLOR_BADGE_CLASS: Record<
    AppointmentStatusColorValue,
    string
> = {
    slate: 'border-slate-200/90 bg-slate-50 text-slate-600 dark:border-slate-700/60 dark:bg-slate-900/45 dark:text-slate-400',
    blue: 'border-blue-200/90 bg-blue-50 text-blue-800 dark:border-blue-900/35 dark:bg-blue-950/45 dark:text-blue-200',
    sky: 'border-sky-200/90 bg-sky-50 text-sky-800 dark:border-sky-900/35 dark:bg-sky-950/45 dark:text-sky-200',
    cyan: 'border-cyan-200/90 bg-cyan-50 text-cyan-800 dark:border-cyan-900/35 dark:bg-cyan-950/45 dark:text-cyan-200',
    teal: 'border-teal-200/90 bg-teal-50 text-teal-800 dark:border-teal-900/35 dark:bg-teal-950/45 dark:text-teal-200',
    green: 'border-green-200/90 bg-green-50 text-green-800 dark:border-green-900/35 dark:bg-green-950/45 dark:text-green-200',
    emerald:
        'border-emerald-200/90 bg-emerald-50 text-emerald-800 dark:border-emerald-900/35 dark:bg-emerald-950/45 dark:text-emerald-200',
    lime: 'border-lime-200/90 bg-lime-50 text-lime-800 dark:border-lime-900/35 dark:bg-lime-950/45 dark:text-lime-200',
    amber: 'border-amber-200/90 bg-amber-50 text-amber-800 dark:border-amber-900/35 dark:bg-amber-950/45 dark:text-amber-200',
    orange: 'border-orange-200/90 bg-orange-50 text-orange-800 dark:border-orange-900/35 dark:bg-orange-950/45 dark:text-orange-200',
    rose: 'border-rose-200/90 bg-rose-50 text-rose-800 dark:border-rose-900/35 dark:bg-rose-950/45 dark:text-rose-200',
    pink: 'border-pink-200/90 bg-pink-50 text-pink-900 dark:border-pink-900/35 dark:bg-pink-950/45 dark:text-pink-200',
    purple: 'border-purple-200/90 bg-purple-50 text-purple-800 dark:border-purple-900/35 dark:bg-purple-950/45 dark:text-purple-200',
    violet: 'border-violet-200/90 bg-violet-50 text-violet-800 dark:border-violet-900/35 dark:bg-violet-950/45 dark:text-violet-200',
    indigo: 'border-indigo-200/90 bg-indigo-50 text-indigo-800 dark:border-indigo-900/35 dark:bg-indigo-950/45 dark:text-indigo-200',
    red: 'border-red-200/90 bg-red-50 text-red-800 dark:border-red-900/35 dark:bg-red-950/45 dark:text-red-200',
};

const APPOINTMENT_STATUS_COLOR_LABELS: Record<
    AppointmentStatusColorValue,
    string
> = {
    slate: 'Gris',
    blue: 'Azul',
    sky: 'Celeste',
    cyan: 'Cian',
    teal: 'Verde azulado',
    green: 'Verde',
    emerald: 'Esmeralda',
    lime: 'Lima',
    amber: 'Ámbar',
    orange: 'Naranja',
    rose: 'Rosado',
    pink: 'Rosa',
    purple: 'Púrpura',
    violet: 'Violeta',
    indigo: 'Índigo',
    red: 'Rojo',
};

export function formatAppointmentStatusColorLabel(
    color: AppointmentStatusColorValue,
): string {
    return APPOINTMENT_STATUS_COLOR_LABELS[color];
}

export function isAppointmentStatusColorValue(
    value: string,
): value is AppointmentStatusColorValue {
    return (APPOINTMENT_STATUS_COLORS as readonly string[]).includes(value);
}

const APPOINTMENT_STATUS_CALENDAR_CLASS: Record<
    AppointmentStatusColorValue,
    string
> = {
    slate: 'event-blue',
    blue: 'event-blue',
    sky: 'event-blue',
    cyan: 'event-blue',
    teal: 'event-green',
    green: 'event-green',
    emerald: 'event-green',
    lime: 'event-yellow',
    amber: 'event-yellow',
    orange: 'event-yellow',
    rose: 'event-pink',
    pink: 'event-pink',
    purple: 'event-purple',
    violet: 'event-purple',
    indigo: 'event-purple',
    red: 'event-pink',
};

export function appointmentStatusColorToCalendarClass(
    color: string,
): string {
    if (isAppointmentStatusColorValue(color)) {
        return APPOINTMENT_STATUS_CALENDAR_CLASS[color];
    }

    return 'event-blue';
}
