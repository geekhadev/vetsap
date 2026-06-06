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

export type FullCalendarProps = {
    className?: string;
    holidays?: CalendarHoliday[];
};
