export function formatMonthLabel(value: string): string {
    const date = new Date(`${value}-01T12:00:00`);

    return date.toLocaleDateString('es-CL', {
        month: 'short',
        year: '2-digit',
    });
}

export function formatMonthTooltip(value: string): string {
    const date = new Date(`${value}-01T12:00:00`);

    return date.toLocaleDateString('es-CL', {
        month: 'long',
        year: 'numeric',
    });
}

export function formatDayLabel(value: string): string {
    const date = new Date(`${value}T12:00:00`);

    return date.toLocaleDateString('es-CL', {
        day: 'numeric',
        month: 'short',
    });
}

export function formatDayTooltip(value: string): string {
    const date = new Date(`${value}T12:00:00`);

    return date.toLocaleDateString('es-CL', {
        weekday: 'short',
        day: 'numeric',
        month: 'long',
    });
}
