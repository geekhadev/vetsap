import type {
    AppointmentService,
    BlockScheduleRow,
    ScheduleBlockConfig,
    TimeBlockSlot,
    Veterinarian,
    VeterinarianBlock,
} from './types';

export type BookingScheduleContext = {
    veterinarianBlocks: VeterinarianBlock[];
    doctors: Veterinarian[];
    blockConfig: ScheduleBlockConfig;
};

function resolveBlockCountForDoctor(
    service: AppointmentService,
    veterinarianId: string,
    doctors: Veterinarian[],
    config: ScheduleBlockConfig,
): number | null {
    const doctor = doctors.find((item) => item.id === veterinarianId);

    if (!doctor || !doctor.serviceIds.includes(service.id)) {
        return null;
    }

    const durationMinutes = doctor.serviceDurations[service.id] ?? service.durationMinutes;

    if (durationMinutes <= 0) {
        return null;
    }

    return Math.ceil(durationMinutes / config.blockMinutes);
}

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
    schedule: BookingScheduleContext,
    date: string,
    service: AppointmentService,
): TimeBlockSlot[] {
    const { veterinarianBlocks, doctors, blockConfig: config } = schedule;
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
        const blockCount = resolveBlockCountForDoctor(service, veterinarianId, doctors, config);

        if (!blockCount || blockCount <= 0) {
            return;
        }

        const sorted = [...vetBlocks].sort((a, b) => a.blockIndex - b.blockIndex);

        for (let index = 0; index <= sorted.length - blockCount; index += 1) {
            const sequence = sorted.slice(index, index + blockCount);
            const isConsecutive = sequence.every((block, offset) => {
                if (!block.available) {
                    return false;
                }

                if (block.blockIndex !== sequence[0].blockIndex + offset) {
                    return false;
                }

                return (
                    block.startTime ===
                    addMinutesToTime(sequence[0].startTime, offset * config.blockMinutes)
                );
            });

            if (!isConsecutive) {
                continue;
            }

            const startBlock = sequence[0];
            const endTime = addMinutesToTime(startBlock.startTime, blockCount * config.blockMinutes);

            slots.push({
                id: `${date}-${startBlock.startTime}-${veterinarianId}-${service.id}`,
                date,
                startTime: startBlock.startTime,
                endTime,
                blockIndex: startBlock.blockIndex,
                blockCount,
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

function formatLocalDateKey(date: Date): string {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
    ].join('-');
}

/** Rango continuo de fechas desde hoy (hora local del navegador). */
function toIsoDayOfWeek(date: Date): number {
    const day = date.getDay();

    return day === 0 ? 7 : day;
}

export function resolveWebBookingDayBlockedReason(
    dateKey: string,
    availableDates: Set<string>,
    holidaysByDate: Map<string, string>,
    scheduledDaysOfWeek: Set<number>,
    veterinarianBlocks: VeterinarianBlock[],
): string | null {
    if (availableDates.has(dateKey)) {
        return null;
    }

    const holidayName = holidaysByDate.get(dateKey);

    if (holidayName) {
        return `Día feriado: ${holidayName}`;
    }

    const date = new Date(`${dateKey}T12:00:00`);

    if (!scheduledDaysOfWeek.has(toIsoDayOfWeek(date))) {
        return 'Sin horario: ningún doctor tiene agenda este día';
    }

    const hasBlocks = veterinarianBlocks.some((block) => block.date === dateKey);

    if (!hasBlocks) {
        return 'Sin horario: ningún doctor tiene agenda este día';
    }

    return 'Sin cupos disponibles para el servicio seleccionado';
}

export function getCalendarDatesFromToday(daysAhead: number): string[] {
    const dates: string[] = [];
    const today = new Date();
    today.setHours(12, 0, 0, 0);

    for (let offset = 0; offset < daysAhead; offset += 1) {
        const date = new Date(today);
        date.setDate(today.getDate() + offset);
        dates.push(formatLocalDateKey(date));
    }

    return dates;
}

export function getAvailableDatesFromBlocks(
    schedule: BookingScheduleContext,
    service: AppointmentService,
): string[] {
    const dates = new Set<string>();

    schedule.veterinarianBlocks.forEach((block) => dates.add(block.date));

    return Array.from(dates)
        .filter((date) => buildBookableSlotsForDate(schedule, date, service).length > 0)
        .sort();
}

export function getDefaultScheduleForService(
    schedule: BookingScheduleContext,
    service: AppointmentService,
): { date: string | null; slotId: string | null } {
    const firstDate = getAvailableDatesFromBlocks(schedule, service)[0] ?? null;

    if (!firstDate) {
        return { date: null, slotId: null };
    }

    const firstSlot = buildBookableSlotsForDate(schedule, firstDate, service)[0];

    return {
        date: firstDate,
        slotId: firstSlot?.id ?? null,
    };
}

export function getFirstBookableSlotForDate(
    schedule: BookingScheduleContext,
    date: string,
    service: AppointmentService,
): string | null {
    return buildBookableSlotsForDate(schedule, date, service)[0]?.id ?? null;
}

/** Marca como no disponibles los bloques consumidos por una cita recién agendada. */
export function consumeBookedBlocks(
    veterinarianBlocks: VeterinarianBlock[],
    slot: TimeBlockSlot,
): VeterinarianBlock[] {
    const consumedIndexes = Array.from(
        { length: slot.blockCount },
        (_, offset) => slot.blockIndex + offset,
    );

    return veterinarianBlocks.map((block) => {
        if (
            block.date !== slot.date ||
            block.veterinarianId !== slot.veterinarianId ||
            !consumedIndexes.includes(block.blockIndex)
        ) {
            return block;
        }

        return { ...block, available: false };
    });
}
