export type CalendarViewId =
    | 'dayGridMonth'
    | 'timeGridWeek'
    | 'threeDay'
    | 'listWeek';

export type CalendarViewOption = {
    id: CalendarViewId;
    label: string;
};

export type CalendarEvent = {
    id: string;
    title: string;
    subtitle: string;
    start: string;
    end: string;
    colorClass: CalendarEventColorClass;
    cancelled?: boolean;
};

export type CalendarEventColorClass =
    | 'event-green'
    | 'event-pink'
    | 'event-purple'
    | 'event-blue'
    | 'event-yellow';

export type CalendarHoliday = {
    id: string;
    name: string;
    date: string;
};

export type CalendarScheduleWindow = {
    dayOfWeek: number;
    startsAt: string;
    endsAt: string;
};

export type CalendarScheduleWindowPayload = {
    day_of_week: number;
    starts_at: string;
    ends_at: string;
};

export type CalendarAppointmentEvent = {
    id: string;
    title: string;
    subtitle: string;
    start: string;
    end: string;
    status_color: string;
    cancelled?: boolean;
};

export type FullCalendarProps = {
    className?: string;
    holidays?: CalendarHoliday[];
    /** ISO 1=lunes … 7=domingo con al menos un doctor activo con horario. */
    scheduledDaysOfWeek?: number[];
    /** Ventanas horarias HH:MM de todos los doctores activos, por día ISO. */
    scheduleWindows?: CalendarScheduleWindow[];
    appointments?: CalendarAppointmentEvent[];
    canCreate?: boolean;
    onNewAppointment?: (defaults?: {
        appointmentDate: string;
        startsAtTime: string;
    }) => void;
    onAppointmentClick?: (appointmentId: string) => void;
};
