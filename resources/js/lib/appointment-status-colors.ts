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

export function resolveAppointmentStatusColor(
    color: string,
): AppointmentStatusColorValue {
    return isAppointmentStatusColorValue(color) ? color : 'slate';
}

/** Clase del evento en calendario, alineada al color del estado (estilos en full-calendar.css). */
export function appointmentStatusCalendarEventClasses(
    color: string,
): string[] {
    return [`event-status-${resolveAppointmentStatusColor(color)}`];
}

const APPOINTMENT_STATUS_DOT_CLASS: Record<
    AppointmentStatusColorValue,
    string
> = {
    slate: 'bg-slate-500',
    blue: 'bg-blue-500',
    sky: 'bg-sky-500',
    cyan: 'bg-cyan-500',
    teal: 'bg-teal-500',
    green: 'bg-green-500',
    emerald: 'bg-emerald-500',
    lime: 'bg-lime-500',
    amber: 'bg-amber-500',
    orange: 'bg-orange-500',
    rose: 'bg-rose-500',
    pink: 'bg-pink-500',
    purple: 'bg-purple-500',
    violet: 'bg-violet-500',
    indigo: 'bg-indigo-500',
    red: 'bg-red-500',
};

export function appointmentStatusColorToDotClass(color: string): string {
    return APPOINTMENT_STATUS_DOT_CLASS[resolveAppointmentStatusColor(color)];
}

/**
 * Misma familia de color que badges / eventos de cita
 * (`border-*-200` + `bg-*-50` en AppointmentStatusColorBadge).
 */
const APPOINTMENT_STATUS_CHART_COLOR: Record<
    AppointmentStatusColorValue,
    string
> = {
    slate: '#e2e8f0',
    blue: '#bfdbfe',
    sky: '#bae6fd',
    cyan: '#a5f3fc',
    teal: '#99f6e4',
    green: '#bbf7d0',
    emerald: '#a7f3d0',
    lime: '#d9f99d',
    amber: '#fde68a',
    orange: '#fed7aa',
    rose: '#fecdd3',
    pink: '#fbcfe8',
    purple: '#e9d5ff',
    violet: '#ddd6fe',
    indigo: '#c7d2fe',
    red: '#fecaca',
};

export function appointmentStatusColorToChartColor(color: string): string {
    return APPOINTMENT_STATUS_CHART_COLOR[resolveAppointmentStatusColor(color)];
}
