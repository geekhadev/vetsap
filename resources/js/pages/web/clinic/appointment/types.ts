export type BookingStep = 'service' | 'details' | 'success';

export type ScheduleBlockConfig = {
    blockMinutes: number;
    daysAhead: number;
};

export type AppointmentService = {
    id: string;
    name: string;
    description: string;
    blockCount: number;
    durationMinutes: number;
};

export type Veterinarian = {
    id: string;
    name: string;
    specialty: string;
    serviceIds: string[];
    serviceDurations: Record<string, number>;
};

/** Bloque base de agenda de un médico (independiente del servicio). */
export type VeterinarianBlock = {
    date: string;
    veterinarianId: string;
    blockIndex: number;
    startTime: string;
    available: boolean;
};

/** Opción reservable: bloque inicial + cantidad de bloques consecutivos para un servicio. */
export type TimeBlockSlot = {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    blockIndex: number;
    blockCount: number;
    veterinarianId: string;
};

/** Fila de UI: mismo bloque horario con uno o más médicos disponibles. */
export type BlockScheduleRow = {
    startTime: string;
    endTime: string;
    blockIndex: number;
    slots: TimeBlockSlot[];
};

export type Pet = {
    id: string;
    customerId: string;
    name: string;
    species: string;
    breed?: string;
};

export type BookingClient = {
    id: string;
    phone: string | null;
    name: string;
    email: string | null;
    pets: Pet[];
};

export type BookingSpecies = {
    id: string;
    name: string;
};

export type PetSelection = {
    mode: 'existing' | 'new';
    petId?: string;
    customerId?: string;
    petName: string;
    speciesId: string;
    petSpecies: string;
};

export type ConfirmedBooking = {
    serviceId: string;
    date: string;
    startTime: string;
    endTime: string;
    veterinarianId: string;
};

export type BookingFormState = {
    step: BookingStep;
    serviceId: string | null;
    date: string | null;
    slotId: string | null;
    phone: string;
    client: BookingClient | null;
    clientLookupDone: boolean;
    petSelection: PetSelection;
    clientName: string;
    clientEmail: string;
    confirmedBooking: ConfirmedBooking | null;
};

export type BookingHoliday = {
    id: string;
    name: string;
    date: string;
};

export type PublicBookingSchedulePayload = {
    services: Array<{
        id: string;
        name: string;
        description: string;
        block_count: number;
        duration_minutes: number;
    }>;
    doctors: Array<{
        id: string;
        name: string;
        specialty: string;
        service_ids: string[];
        service_durations: Record<string, number>;
    }>;
    block_config: {
        block_minutes: number;
        days_ahead: number;
    };
    veterinarian_blocks: Array<{
        date: string;
        veterinarian_id: string;
        block_index: number;
        start_time: string;
        available: boolean;
    }>;
    holidays: BookingHoliday[];
    scheduled_days_of_week: number[];
    species: Array<{
        id: string;
        name: string;
    }>;
};

export type PublicBookingSchedule = {
    services: AppointmentService[];
    doctors: Veterinarian[];
    blockConfig: ScheduleBlockConfig;
    veterinarianBlocks: VeterinarianBlock[];
    holidays: BookingHoliday[];
    scheduledDaysOfWeek: number[];
    species: BookingSpecies[];
};

export function mapPublicBookingSchedule(payload: PublicBookingSchedulePayload): PublicBookingSchedule {
    return {
        services: payload.services.map((service) => ({
            id: service.id,
            name: service.name,
            description: service.description,
            blockCount: service.block_count,
            durationMinutes: service.duration_minutes,
        })),
        doctors: payload.doctors.map((doctor) => ({
            id: doctor.id,
            name: doctor.name,
            specialty: doctor.specialty,
            serviceIds: doctor.service_ids,
            serviceDurations: doctor.service_durations,
        })),
        blockConfig: {
            blockMinutes: payload.block_config.block_minutes,
            daysAhead: payload.block_config.days_ahead,
        },
        veterinarianBlocks: payload.veterinarian_blocks.map((block) => ({
            date: block.date,
            veterinarianId: block.veterinarian_id,
            blockIndex: block.block_index,
            startTime: block.start_time,
            available: block.available,
        })),
        holidays: payload.holidays,
        scheduledDaysOfWeek: payload.scheduled_days_of_week,
        species: payload.species.map((species) => ({
            id: species.id,
            name: species.name,
        })),
    };
}
