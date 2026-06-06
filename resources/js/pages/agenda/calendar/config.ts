import type { CalendarHoliday } from '@/components/custom/full-calendar/types';
import { dashboard } from '@/routes';
import { index as calendarIndex } from '@/routes/agenda/calendar';
import type { BreadcrumbItem } from '@/types/navigation';

export type CalendarIndexPageProps = {
    holidays: CalendarHoliday[];
};

export const CALENDAR_PAGE = {
    title: 'Calendario',
    breadcrumbs: (): BreadcrumbItem[] => [
        { title: 'Panel', href: dashboard() },
        { title: 'Calendario', href: calendarIndex() },
    ],
} as const;
