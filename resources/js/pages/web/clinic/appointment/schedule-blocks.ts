import type { AppointmentService, BlockScheduleRow, ScheduleBlockConfig, TimeBlockSlot, VeterinarianBlock } from './types';

export function addMinutesToTime(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const total = hours * 60 + mins + minutes;
    const normalized = ((total % (24 * 60)) + 24 * 60) % (24 * 60);

    return `${String(Math.floor(normalized / 60)).padStart(2, '0')}:${String(normalized % 60).padStart(2, '0')}`;
}

export function getServiceDurationMinutes(service: AppointmentService, config: ScheduleBlockConfig): number {
    return service.blockCount * config.blockMinutes;
}

export function generateDayBlockStarts(
    fromTime: string,
    toTime: string,
    blockMinutes: number,
): string[] {
    const starts: string[] = [];
    let current = fromTime;

    while (current < toTime) {
        starts.push(current);
        current = addMinutesToTime(current, blockMinutes);
    }

    return starts;
}

export function buildBookableSlotsForDate(
    veterinarianBlocks: VeterinarianBlock[],
    date: string,
    service: AppointmentService,
    config: ScheduleBlockConfig,
): TimeBlockSlot[] {
    const slots: TimeBlockSlot[] = [];
    const blocksForDate = veterinarianBlocks
        .filter((block) => block.date === date)
        .sort((a, b) => a.blockIndex - b.blockIndex);

    const byVet = new Map<string, VeterinarianBlock[]>();

    blocksForDate.forEach((block) => {
        const list = byVet.get(block.veterinarianId) ?? [];
        list.push(block);
        byVet.set(block.veterinarianId, list);
    });

    byVet.forEach((vetBlocks, veterinarianId) => {
        const sorted = [...vetBlocks].sort((a, b) => a.blockIndex - b.blockIndex);

        for (let index = 0; index <= sorted.length - service.blockCount; index += 1) {
            const sequence = sorted.slice(index, index + service.blockCount);
            const isConsecutive = sequence.every((block, offset) => {
                if (!block.available) {
                    return false;
                }

                return block.blockIndex === sequence[0].blockIndex + offset;
            });

            if (!isConsecutive) {
                continue;
            }

            const startBlock = sequence[0];
            const endTime = addMinutesToTime(startBlock.startTime, service.blockCount * config.blockMinutes);

            slots.push({
                id: `${date}-${startBlock.startTime}-${veterinarianId}-${service.id}`,
                date,
                startTime: startBlock.startTime,
                endTime,
                blockIndex: startBlock.blockIndex,
                blockCount: service.blockCount,
                veterinarianId,
            });
        }
    });

    return slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export function groupSlotsIntoBlockRows(slots: TimeBlockSlot[]): BlockScheduleRow[] {
    const byStart = new Map<string, TimeBlockSlot[]>();

    slots.forEach((slot) => {
        const key = `${slot.blockIndex}-${slot.startTime}`;
        const list = byStart.get(key) ?? [];
        list.push(slot);
        byStart.set(key, list);
    });

    return Array.from(byStart.values())
        .map((rowSlots) => {
            const first = rowSlots[0];

            return {
                startTime: first.startTime,
                endTime: first.endTime,
                blockIndex: first.blockIndex,
                slots: rowSlots.sort((a, b) => a.veterinarianId.localeCompare(b.veterinarianId)),
            };
        })
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export function getAvailableDatesFromBlocks(
    veterinarianBlocks: VeterinarianBlock[],
    service: AppointmentService,
    config: ScheduleBlockConfig,
): string[] {
    const dates = new Set<string>();

    veterinarianBlocks.forEach((block) => dates.add(block.date));

    return Array.from(dates)
        .filter((date) => buildBookableSlotsForDate(veterinarianBlocks, date, service, config).length > 0)
        .sort();
}

export function getDefaultScheduleForService(
    veterinarianBlocks: VeterinarianBlock[],
    service: AppointmentService,
    config: ScheduleBlockConfig,
): { date: string | null; slotId: string | null } {
    const firstDate = getAvailableDatesFromBlocks(veterinarianBlocks, service, config)[0] ?? null;

    if (!firstDate) {
        return { date: null, slotId: null };
    }

    const firstSlot = buildBookableSlotsForDate(veterinarianBlocks, firstDate, service, config)[0];

    return {
        date: firstDate,
        slotId: firstSlot?.id ?? null,
    };
}

export function getFirstBookableSlotForDate(
    veterinarianBlocks: VeterinarianBlock[],
    date: string,
    service: AppointmentService,
    config: ScheduleBlockConfig,
): string | null {
    return buildBookableSlotsForDate(veterinarianBlocks, date, service, config)[0]?.id ?? null;
}
