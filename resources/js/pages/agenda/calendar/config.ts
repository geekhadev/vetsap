import { dashboard } from '@/routes';
import { index as calendarIndex } from '@/routes/agenda/calendar';
import type { BreadcrumbItem } from '@/types/navigation';

export type { CalendarIndexPageProps } from '@/pages/agenda/calendar/types';

export const CALENDAR_PAGE = {
    title: 'Calendario',
    breadcrumbs: (): BreadcrumbItem[] => [
        { title: 'Panel', href: dashboard() },
        { title: 'Calendario', href: calendarIndex() },
    ],
} as const;
