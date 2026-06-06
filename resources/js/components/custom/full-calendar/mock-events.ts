import { CALENDAR_SLOT_DURATION_MINUTES } from './config';
import type { CalendarEvent } from './types';

function todayAt(hours: number, minutes = 0): string {
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toISOString();
}

function dayOffsetAt(dayOffset: number, hours: number, minutes = 0): string {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    date.setHours(hours, minutes, 0, 0);

    return date.toISOString();
}

/** Fin de bloque(s) a partir de un inicio alineado a la grilla de 30 min. */
function blockEndAt(
    dayOffset: number,
    hours: number,
    minutes: number,
    blocks = 1,
): string {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    date.setHours(hours, minutes, 0, 0);
    date.setMinutes(
        date.getMinutes() + blocks * CALENDAR_SLOT_DURATION_MINUTES,
    );

    return date.toISOString();
}

function todayBlockEnd(hours: number, minutes: number, blocks = 1): string {
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    date.setMinutes(
        date.getMinutes() + blocks * CALENDAR_SLOT_DURATION_MINUTES,
    );

    return date.toISOString();
}

/** Eventos de demostración hasta conectar el módulo de citas. */
export const CALENDAR_DEMO_EVENTS: CalendarEvent[] = [
    {
        id: '1',
        title: 'Ashly',
        subtitle: 'María Fernández — Vacunación',
        start: dayOffsetAt(0, 9, 0),
        end: blockEndAt(0, 9, 0),
        colorClass: 'event-green',
    },
    {
        id: '2',
        title: 'Nickolas',
        subtitle: 'Carlos Ruiz — Control',
        start: dayOffsetAt(0, 9, 30),
        end: blockEndAt(0, 9, 30),
        colorClass: 'event-green',
        cancelled: true,
    },
    {
        id: '3',
        title: 'Gerard',
        subtitle: 'Ana López — Consulta',
        start: dayOffsetAt(0, 10, 0),
        end: blockEndAt(0, 10, 0),
        colorClass: 'event-pink',
    },
    {
        id: '4',
        title: 'Nellie',
        subtitle: 'Pedro Soto — Baño',
        start: dayOffsetAt(0, 11, 0),
        end: blockEndAt(0, 11, 0),
        colorClass: 'event-purple',
    },
    {
        id: '5',
        title: 'Ena',
        subtitle: 'Laura Vega — Vacunación',
        start: dayOffsetAt(1, 9, 0),
        end: blockEndAt(1, 9, 0),
        colorClass: 'event-blue',
    },
    {
        id: '6',
        title: 'Sofia',
        subtitle: 'Diego Mora — Control',
        start: dayOffsetAt(1, 10, 30),
        end: blockEndAt(1, 10, 30),
        colorClass: 'event-yellow',
    },
    {
        id: '7',
        title: 'Archibald',
        subtitle: 'Camila Rojas — Consulta',
        start: dayOffsetAt(2, 11, 0),
        end: blockEndAt(2, 11, 0),
        colorClass: 'event-yellow',
    },
    {
        id: '8',
        title: 'Max',
        subtitle: 'Jorge Pérez — Urgencia',
        start: todayAt(14, 0),
        end: todayBlockEnd(14, 0),
        colorClass: 'event-pink',
    },
];
