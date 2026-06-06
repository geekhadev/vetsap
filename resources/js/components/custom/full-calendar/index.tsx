import type { DayHeaderContentArg, EventContentArg, DateSpanApi } from '@fullcalendar/core';
import esLocale from '@fullcalendar/core/locales/es';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { ChevronLeft, ChevronRight, CirclePlus } from 'lucide-react';
import { useCallback, useMemo, useRef, useState  } from 'react';
import type {CSSProperties} from 'react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import {
    CALENDAR_DEFAULT_EVENT_DURATION,
    CALENDAR_SLOT_DURATION_MINUTES,
    CALENDAR_SLOT_HEIGHT,
    CALENDAR_SLOT_LABEL_FORMAT,
    CALENDAR_TIMEGRID_VIEW_OPTIONS,
    isTimeGridView,
    resolveCalendarScrollTime,
    viewIncludesToday,
} from './config';
import {
    buildHolidayBackgroundEvents,
    buildHolidayByDateMap,
    buildHolidayDateSet,
    filterEventsExcludingHolidays,
    isCalendarHolidayDate,
    toCalendarDateKey,
} from './holidays';
import { CALENDAR_DEMO_EVENTS } from './mock-events';
import type {
    CalendarViewId,
    CalendarViewOption,
    FullCalendarProps,
} from './types';
import './full-calendar.css';

const CALENDAR_VIEWS: CalendarViewOption[] = [
    { id: 'dayGridMonth', label: 'Mes' },
    { id: 'timeGridWeek', label: 'Semana' },
    { id: 'threeDay', label: '3 días' },
    { id: 'listWeek', label: 'Lista' },
];

function renderEventContent(arg: EventContentArg) {
    if (arg.event.extendedProps.isHoliday) {
        const holidayName = arg.event.extendedProps.holidayName as string;

        return (
            <div className="fc-holiday-label">{holidayName}</div>
        );
    }

    const subtitle = arg.event.extendedProps.subtitle as string | undefined;
    const cancelled = Boolean(arg.event.extendedProps.cancelled);
    const durationMs =
        arg.event.end && arg.event.start
            ? arg.event.end.getTime() - arg.event.start.getTime()
            : 0;
    const isListView = arg.view.type.startsWith('list');
    const showSubtitle =
        Boolean(subtitle) &&
        (isListView ||
            durationMs >= (CALENDAR_SLOT_DURATION_MINUTES - 5) * 60 * 1000);

    return (
        <div
            className={cn('fc-custom-event', cancelled && 'is-cancelled')}
        >
            <div className="fc-custom-event-title">{arg.event.title}</div>
            {showSubtitle ? (
                <div className="fc-custom-event-subtitle">{subtitle}</div>
            ) : null}
        </div>
    );
}

export function VetsapFullCalendar({
    className,
    holidays = [],
}: FullCalendarProps) {
    const calendarRef = useRef<FullCalendar>(null);
    const [activeView, setActiveView] = useState<CalendarViewId>('threeDay');
    const initialScrollTime = useMemo(() => resolveCalendarScrollTime(), []);

    const holidayDates = useMemo(
        () => buildHolidayDateSet(holidays),
        [holidays],
    );

    const holidaysByDate = useMemo(
        () => buildHolidayByDateMap(holidays),
        [holidays],
    );

    const holidayBackgroundEvents = useMemo(
        () => buildHolidayBackgroundEvents(holidays),
        [holidays],
    );

    const appointmentEvents = useMemo(
        () =>
            filterEventsExcludingHolidays(CALENDAR_DEMO_EVENTS, holidayDates).map(
                (event) => ({
                    id: event.id,
                    title: event.title,
                    start: event.start,
                    end: event.end,
                    classNames: [
                        event.colorClass,
                        ...(event.cancelled
                            ? ['is-cancelled', 'event-completed']
                            : []),
                    ],
                    extendedProps: {
                        subtitle: event.subtitle,
                        cancelled: event.cancelled ?? false,
                    },
                }),
            ),
        [holidayDates],
    );

    const scrollToNow = useCallback(() => {
        const api = calendarRef.current?.getApi();

        if (!api) {
            return;
        }

        requestAnimationFrame(() => {
            api.scrollToTime(resolveCalendarScrollTime());
        });
    }, []);

    const events = useMemo(
        () => [...holidayBackgroundEvents, ...appointmentEvents],
        [holidayBackgroundEvents, appointmentEvents],
    );

    const dayHeaderContent = useCallback(
        (arg: DayHeaderContentArg) => {
            const holiday = holidaysByDate.get(toCalendarDateKey(arg.date));

            if (!holiday) {
                return arg.text;
            }

            return (
                <div className="fc-holiday-header">
                    <span className="fc-holiday-header-date">{arg.text}</span>
                    <span className="fc-holiday-header-name">{holiday.name}</span>
                </div>
            );
        },
        [holidaysByDate],
    );

    const dayHeaderClassNames = useCallback(
        (arg: { date: Date }) =>
            isCalendarHolidayDate(arg.date, holidayDates)
                ? ['is-holiday-header']
                : [],
        [holidayDates],
    );

    const dayCellClassNames = useCallback(
        (arg: { date: Date }) =>
            isCalendarHolidayDate(arg.date, holidayDates)
                ? ['is-holiday-day']
                : [],
        [holidayDates],
    );

    const selectAllow = useCallback(
        (selectInfo: DateSpanApi) =>
            !isCalendarHolidayDate(selectInfo.start, holidayDates),
        [holidayDates],
    );

    const handlePrev = useCallback(() => {
        calendarRef.current?.getApi().prev();
    }, []);

    const handleNext = useCallback(() => {
        calendarRef.current?.getApi().next();
    }, []);

    const handleToday = useCallback(() => {
        calendarRef.current?.getApi().today();
    }, []);

    const handleViewChange = useCallback((viewId: string) => {
        if (!viewId) {
            return;
        }

        const nextView = viewId as CalendarViewId;
        calendarRef.current?.getApi().changeView(nextView);
        setActiveView(nextView);
    }, []);

    return (
        <div
            className={cn('vetsap-full-calendar', className)}
            style={
                {
                    '--fc-slot-height': CALENDAR_SLOT_HEIGHT,
                } as CSSProperties
            }
        >
            <div className="flex shrink-0 flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={handlePrev}
                        aria-label="Periodo anterior"
                    >
                        <ChevronLeft className="size-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={handleNext}
                        aria-label="Periodo siguiente"
                    >
                        <ChevronRight className="size-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleToday}
                    >
                        Hoy
                    </Button>
                </div>

                <ToggleGroup
                    type="single"
                    variant="default"
                    size="sm"
                    value={activeView}
                    onValueChange={handleViewChange}
                    className="w-full rounded-md bg-muted p-0.5 sm:w-auto"
                >
                    {CALENDAR_VIEWS.map((view) => (
                        <ToggleGroupItem
                            key={view.id}
                            value={view.id}
                            aria-label={view.label}
                            className="flex-1 border-0 px-3 shadow-none data-[state=on]:bg-background data-[state=on]:text-foreground sm:flex-none"
                        >
                            {view.label}
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>

                <Button type="button" size="sm" className="shrink-0">
                    <CirclePlus className="size-4" />
                    Nueva cita
                </Button>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden px-4 pt-3 pb-4">
                <FullCalendar
                    ref={calendarRef}
                    plugins={[
                        dayGridPlugin,
                        timeGridPlugin,
                        listPlugin,
                        interactionPlugin,
                    ]}
                    initialView="threeDay"
                    headerToolbar={false}
                    locale={esLocale}
                    firstDay={1}
                    {...CALENDAR_TIMEGRID_VIEW_OPTIONS}
                    slotLabelFormat={CALENDAR_SLOT_LABEL_FORMAT}
                    defaultTimedEventDuration={CALENDAR_DEFAULT_EVENT_DURATION}
                    dayHeaderFormat={{
                        weekday: 'short',
                        day: 'numeric',
                        month: 'numeric',
                        omitCommas: true,
                    }}
                    allDaySlot={false}
                    nowIndicator
                    scrollTime={initialScrollTime}
                    scrollTimeReset={false}
                    height="100%"
                    expandRows={false}
                    eventMinHeight={40}
                    events={events}
                    eventContent={renderEventContent}
                    dayHeaderContent={dayHeaderContent}
                    dayHeaderClassNames={dayHeaderClassNames}
                    dayCellClassNames={dayCellClassNames}
                    selectAllow={selectAllow}
                    views={{
                        timeGridWeek: {
                            ...CALENDAR_TIMEGRID_VIEW_OPTIONS,
                        },
                        threeDay: {
                            type: 'timeGrid',
                            duration: { days: 3 },
                            ...CALENDAR_TIMEGRID_VIEW_OPTIONS,
                        },
                    }}
                    datesSet={({ view }) => {
                        setActiveView(view.type as CalendarViewId);

                        if (
                            isTimeGridView(view.type) &&
                            viewIncludesToday(view.activeStart, view.activeEnd)
                        ) {
                            scrollToNow();
                        }
                    }}
                />
            </div>
        </div>
    );
}
