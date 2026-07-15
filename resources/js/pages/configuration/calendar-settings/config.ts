import { buildModuleBreadcrumbs } from '@/lib/module-breadcrumbs';
import { index as calendarSettingsIndex } from '@/routes/configuration/calendar-settings';
import type { BreadcrumbItem } from '@/types/navigation';

export const CALENDAR_SETTINGS_PAGE = {
    title: 'Configuración del calendario',
    description:
        'Ajustes disponibles para el módulo de calendario. Al personalizar su configuración, podrás gestionar la agenda de manera más rápida y eficiente.',
    breadcrumbs: (): BreadcrumbItem[] => buildModuleBreadcrumbs('Configuración del calendario', calendarSettingsIndex()),
} as const;

export const TIME_BLOCK_OPTIONS = [
    { id: '15', label: '15 minutos' },
    { id: '30', label: '30 minutos' },
    { id: '45', label: '45 minutos' },
    { id: '60', label: '60 minutos' },
] as const;
