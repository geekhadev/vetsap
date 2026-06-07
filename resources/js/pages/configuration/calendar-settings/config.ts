import { dashboard } from '@/routes';
import { index as calendarSettingsIndex } from '@/routes/configuration/calendar-settings';
import type { BreadcrumbItem } from '@/types/navigation';

export const CALENDAR_SETTINGS_PAGE = {
    title: 'Configuración del calendario',
    description:
        'Ajustes disponibles para el módulo de calendario. Al personalizar su configuración, podrás gestionar la agenda de manera más rápida y eficiente.',
    breadcrumbs: (): BreadcrumbItem[] => [
        { title: 'Panel', href: dashboard() },
        {
            title: 'Configuración del calendario',
            href: calendarSettingsIndex(),
        },
    ],
} as const;

export const TIME_BLOCK_OPTIONS = [
    { value: '15', label: '15 minutos' },
    { value: '30', label: '30 minutos' },
    { value: '45', label: '45 minutos' },
    { value: '60', label: '60 minutos' },
] as const;
