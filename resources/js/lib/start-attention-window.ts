/**
 * Ventana relativa a `starts_at` en la que se puede iniciar una atención.
 */
export function isWithinStartAttentionWindow(
    startsAtIso: string,
    minutesBefore: number,
    minutesAfter: number,
    now: Date = new Date(),
): boolean {
    const startsAt = new Date(startsAtIso);

    if (Number.isNaN(startsAt.getTime())) {
        return false;
    }

    const earliestMs = startsAt.getTime() - Math.max(0, minutesBefore) * 60_000;
    const latestMs = startsAt.getTime() + Math.max(0, minutesAfter) * 60_000;
    const nowMs = now.getTime();

    return nowMs >= earliestMs && nowMs <= latestMs;
}
