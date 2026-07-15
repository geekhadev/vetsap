import type {
    DayHeaderContentArg,
    EventClickArg,
    EventContentArg,
    EventMountArg,
    DateSpanApi,
} from '@fullcalendar/core';
import esLocale from '@fullcalendar/core/locales/es';
import dayGridPlugin from '@fullcalendar/daygrid';
import type { DateClickArg } from '@fullcalendar/interaction';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { ChevronLeft, ChevronRight, CirclePlus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {CSSProperties} from 'react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { appointmentStatusCalendarEventClasses } from '@/lib/appointment-status-colors';
import { cn } from '@/lib/utils';
import { BlockedDayHoverTooltip } from './blocked-day-hover-tooltip';
import {
    annotateBlockedCalendarElements,
    applyBlockedDayReason,
    buildScheduledDaysOfWeekSet,
    buildUnscheduledDayRootClasses,
    isCalendarBlockedDate,
    isCalendarUnscheduledDate,
    resolveBlockedDayReason,
} from './blocked-days';
import {
    buildSlotDefaultsFromDate,
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
import {
    buildUnavailableScheduleBackgroundEvents,
    isDateTimeWithinSchedule,
} from './schedule-windows';
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

const APPOINTMENT_ID_DATA_ATTRIBUTE = 'data-appointment-id';

function findAppointmentIdInElement(element: Element | null): string | null {
    if (!element) {
        return null;
    }

    const marked = element.closest(`[${APPOINTMENT_ID_DATA_ATTRIBUTE}]`);

    if (marked) {
        return marked.getAttribute(APPOINTMENT_ID_DATA_ATTRIBUTE);
    }

    const eventEl = element.closest(
        '.fc-event:not(.fc-bg-event), .fc-list-event',
    );

    if (eventEl) {
        return eventEl.getAttribute(APPOINTMENT_ID_DATA_ATTRIBUTE);
    }

    const harness = element.closest(
        '.fc-timegrid-event-harness, .fc-daygrid-event-harness',
    );

    if (harness) {
        const appointmentEvent = harness.querySelector(
            '.fc-event:not(.fc-bg-event)',
        );

        return appointmentEvent?.getAttribute(APPOINTMENT_ID_DATA_ATTRIBUTE) ?? null;
    }

    return null;
}

function resolveAppointmentIdFromPointerEvent(
    event: MouseEvent | PointerEvent,
): string | null {
    const { clientX, clientY } = event;

    if (typeof document.elementsFromPoint === 'function') {
        for (const element of document.elementsFromPoint(clientX, clientY)) {
            const appointmentId = findAppointmentIdInElement(element);

            if (appointmentId) {
                return appointmentId;
            }
        }
    }

    const hit = document.elementFromPoint(clientX, clientY);
    const fromHit = findAppointmentIdInElement(hit);

    if (fromHit) {
        return fromHit;
    }

    if (event.target instanceof Element) {
        return findAppointmentIdInElement(event.target);
    }

    return null;
}

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
            data-appointment-id={String(arg.event.id)}
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
    scheduledDaysOfWeek = [],
    scheduleWindows = [],
    appointments = [],
    canCreate = false,
    onNewAppointment,
    onAppointmentClick,
}: FullCalendarProps) {
    const calendarRef = useRef<FullCalendar>(null);
    const calendarRootRef = useRef<HTMLDivElement>(null);
    const timeGridEventClickCleanups = useRef(
        new WeakMap<HTMLElement, () => void>(),
    );
    const [activeView, setActiveView] = useState<CalendarViewId>('threeDay');
    const initialScrollTime = useMemo(() => resolveCalendarScrollTime(), []);

    const holidayDates = useMemo(
        () => buildHolidayDateSet(holidays),
        [holidays],
    );

    const scheduledDays = useMemo(
        () => buildScheduledDaysOfWeekSet(scheduledDaysOfWeek),
        [scheduledDaysOfWeek],
    );

    const unscheduledDayRootClasses = useMemo(
        () => buildUnscheduledDayRootClasses(scheduledDays),
        [scheduledDays],
    );

    const holidaysByDate = useMemo(
        () => buildHolidayByDateMap(holidays),
        [holidays],
    );

    const holidayBackgroundEvents = useMemo(
        () => buildHolidayBackgroundEvents(holidays),
        [holidays],
    );

    const scheduleBlockedEventsRange = useMemo(() => {
        const rangeStart = new Date();
        rangeStart.setMonth(rangeStart.getMonth() - 1);
        rangeStart.setHours(0, 0, 0, 0);

        const rangeEnd = new Date();
        rangeEnd.setMonth(rangeEnd.getMonth() + 3);
        rangeEnd.setHours(23, 59, 59, 999);

        return { rangeStart, rangeEnd };
    }, []);

    const scheduleBlockedBackgroundEvents = useMemo(
        () =>
            buildUnavailableScheduleBackgroundEvents(
                scheduleWindows,
                holidayDates,
                scheduledDays,
                scheduleBlockedEventsRange.rangeStart,
                scheduleBlockedEventsRange.rangeEnd,
            ),
        [
            scheduleWindows,
            holidayDates,
            scheduledDays,
            scheduleBlockedEventsRange,
        ],
    );

    const appointmentEvents = useMemo(
        () =>
            filterEventsExcludingHolidays(
                appointments.map((event) => ({
                    id: event.id,
                    title: event.title,
                    subtitle: event.subtitle,
                    start: event.start,
                    end: event.end,
                    statusColor: event.status_color,
                    cancelled: event.cancelled ?? false,
                })),
                holidayDates,
            ).map((event) => ({
                id: event.id,
                title: event.title,
                start: event.start,
                end: event.end,
                classNames: [
                    'is-appointment-event',
                    ...appointmentStatusCalendarEventClasses(event.statusColor),
                    ...(event.cancelled ? ['is-cancelled'] : []),
                ],
                extendedProps: {
                    subtitle: event.subtitle,
                    cancelled: event.cancelled ?? false,
                    statusColor: event.statusColor,
                },
            })),
        [appointments, holidayDates],
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
        () => [
            ...holidayBackgroundEvents,
            ...scheduleBlockedBackgroundEvents,
            ...appointmentEvents,
        ],
        [holidayBackgroundEvents, scheduleBlockedBackgroundEvents, appointmentEvents],
    );

    const dayHeaderContent = useCallback(
        (arg: DayHeaderContentArg) => {
            const holiday = holidaysByDate.get(toCalendarDateKey(arg.date));

            if (holiday) {
                return (
                    <div className="fc-holiday-header">
                        <span className="fc-holiday-header-date">{arg.text}</span>
                        <span className="fc-holiday-header-name">{holiday.name}</span>
                    </div>
                );
            }

            if (isCalendarUnscheduledDate(arg.date, scheduledDays)) {
                return (
                    <div className="fc-unscheduled-header">
                        <span className="fc-unscheduled-header-date">{arg.text}</span>
                        <span className="fc-unscheduled-header-name">Sin horario</span>
                    </div>
                );
            }

            return arg.text;
        },
        [holidaysByDate, scheduledDays],
    );

    const dayHeaderClassNames = useCallback(
        (arg: { date: Date }) => {
            if (isCalendarHolidayDate(arg.date, holidayDates)) {
                return ['is-holiday-header'];
            }

            if (isCalendarUnscheduledDate(arg.date, scheduledDays)) {
                return ['is-unscheduled-header'];
            }

            return [];
        },
        [holidayDates, scheduledDays],
    );

    const dayCellClassNames = useCallback(
        (arg: { date: Date }) => {
            if (isCalendarHolidayDate(arg.date, holidayDates)) {
                return ['is-holiday-day'];
            }

            if (isCalendarUnscheduledDate(arg.date, scheduledDays)) {
                return ['is-unscheduled-day'];
            }

            return [];
        },
        [holidayDates, scheduledDays],
    );

    const selectAllow = useCallback(
        (selectInfo: DateSpanApi) =>
            isDateTimeWithinSchedule(
                selectInfo.start,
                scheduleWindows,
                scheduledDays,
                holidayDates,
            ),
        [scheduleWindows, scheduledDays, holidayDates],
    );

    const handleAppointmentPointerUp = useCallback(
        (event: PointerEvent) => {
            if (!onAppointmentClick) {
                return;
            }

            const appointmentId = resolveAppointmentIdFromPointerEvent(event);

            if (!appointmentId) {
                return;
            }

            event.preventDefault();
            event.stopImmediatePropagation();
            onAppointmentClick(appointmentId);
        },
        [onAppointmentClick],
    );

    useEffect(() => {
        const root = calendarRootRef.current;

        if (!root || !onAppointmentClick) {
            return;
        }

        root.addEventListener('pointerup', handleAppointmentPointerUp, true);

        return () => {
            root.removeEventListener(
                'pointerup',
                handleAppointmentPointerUp,
                true,
            );
        };
    }, [handleAppointmentPointerUp, onAppointmentClick]);

    const handleDateClick = useCallback(
        (arg: DateClickArg) => {
            const appointmentId = resolveAppointmentIdFromPointerEvent(
                arg.jsEvent,
            );

            if (appointmentId) {
                return;
            }

            if (!canCreate || !onNewAppointment) {
                return;
            }

            if (isTimeGridView(arg.view.type)) {
                if (
                    !isDateTimeWithinSchedule(
                        arg.date,
                        scheduleWindows,
                        scheduledDays,
                        holidayDates,
                    )
                ) {
                    return;
                }
            } else if (
                isCalendarBlockedDate(arg.date, holidayDates, scheduledDays)
            ) {
                return;
            }

            onNewAppointment(buildSlotDefaultsFromDate(arg.date));
        },
        [
            canCreate,
            holidayDates,
            onNewAppointment,
            scheduleWindows,
            scheduledDays,
        ],
    );

    const handleEventClick = useCallback(
        (arg: EventClickArg) => {
            if (arg.event.extendedProps.isHoliday) {
                return;
            }

            if (!onAppointmentClick) {
                return;
            }

            arg.jsEvent.preventDefault();
            arg.jsEvent.stopPropagation();
            onAppointmentClick(String(arg.event.id));
        },
        [onAppointmentClick],
    );

    const annotateBlockedDays = useCallback(() => {
        const root = calendarRootRef.current;

        if (!root) {
            return;
        }

        annotateBlockedCalendarElements(root, holidaysByDate, scheduledDays);
    }, [holidaysByDate, scheduledDays]);

    const handleDayHeaderDidMount = useCallback(
        (arg: { date: Date; el: HTMLElement }) => {
            applyBlockedDayReason(
                arg.el,
                resolveBlockedDayReason(arg.date, holidaysByDate, scheduledDays),
            );
        },
        [holidaysByDate, scheduledDays],
    );

    const handleDayCellDidMount = useCallback(
        (arg: { date: Date; el: HTMLElement }) => {
            applyBlockedDayReason(
                arg.el,
                resolveBlockedDayReason(arg.date, holidaysByDate, scheduledDays),
            );
        },
        [holidaysByDate, scheduledDays],
    );

    const handleEventDidMount = useCallback(
        (arg: EventMountArg) => {
            if (arg.event.extendedProps.isHoliday) {
                const holidayName = arg.event.extendedProps.holidayName as string;

                applyBlockedDayReason(arg.el, `Día feriado: ${holidayName}`);

                return;
            }

            if (arg.event.extendedProps.isScheduleBlocked) {
                applyBlockedDayReason(
                    arg.el,
                    String(arg.event.extendedProps.blockedReason),
                );

                return;
            }

            if (!arg.event.id) {
                return;
            }

            const appointmentId = String(arg.event.id);

            arg.el.setAttribute(APPOINTMENT_ID_DATA_ATTRIBUTE, appointmentId);
            arg.el.style.cursor = 'pointer';

            const harness = arg.el.closest(
                '.fc-timegrid-event-harness, .fc-daygrid-event-harness',
            );

            if (harness instanceof HTMLElement) {
                harness.setAttribute(APPOINTMENT_ID_DATA_ATTRIBUTE, appointmentId);
                harness.style.cursor = 'pointer';
            }

            const viewType = arg.view.type;

            if (!viewType.includes('timeGrid') && viewType !== 'threeDay') {
                return;
            }

            if (!onAppointmentClick) {
                return;
            }

            const handleTimeGridClick = (mouseEvent: MouseEvent) => {
                mouseEvent.preventDefault();
                mouseEvent.stopPropagation();
                onAppointmentClick(appointmentId);
            };

            arg.el.addEventListener('click', handleTimeGridClick);
            timeGridEventClickCleanups.current.set(arg.el, () => {
                arg.el.removeEventListener('click', handleTimeGridClick);
            });
        },
        [onAppointmentClick],
    );

    const handleEventWillUnmount = useCallback((arg: EventMountArg) => {
        const cleanup = timeGridEventClickCleanups.current.get(arg.el);

        if (cleanup) {
            cleanup();
            timeGridEventClickCleanups.current.delete(arg.el);
        }
    }, []);

    const handleNewAppointmentClick = useCallback(() => {
        onNewAppointment?.();
    }, [onNewAppointment]);

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
            className={cn(
                'vetsap-full-calendar',
                (canCreate || onAppointmentClick) && 'is-slot-selectable',
                unscheduledDayRootClasses,
                className,
            )}
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

                {canCreate ? (
                    <Button
                        type="button"
                        size="sm"
                        className="shrink-0"
                        onClick={handleNewAppointmentClick}
                    >
                        <CirclePlus className="size-4" />
                        Nueva cita
                    </Button>
                ) : null}
            </div>

            <div
                ref={calendarRootRef}
                className="min-h-0 flex-1 overflow-hidden px-4 pt-3 pb-4"
            >
                <BlockedDayHoverTooltip containerRef={calendarRootRef} />
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
                    eventMinHeight={36}
                    events={events}
                    eventContent={renderEventContent}
                    eventDidMount={handleEventDidMount}
                    eventWillUnmount={handleEventWillUnmount}
                    dayHeaderContent={dayHeaderContent}
                    dayHeaderClassNames={dayHeaderClassNames}
                    dayHeaderDidMount={handleDayHeaderDidMount}
                    dayCellClassNames={dayCellClassNames}
                    dayCellDidMount={handleDayCellDidMount}
                    selectAllow={selectAllow}
                    dateClick={canCreate ? handleDateClick : undefined}
                    eventClick={onAppointmentClick ? handleEventClick : undefined}
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

                        requestAnimationFrame(() => {
                            annotateBlockedDays();
                        });

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
