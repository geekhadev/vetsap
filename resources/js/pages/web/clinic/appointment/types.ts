export type BookingStep = 'service' | 'details' | 'success';

export type ScheduleBlockConfig = {
    blockMinutes: number;
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
    name: string;
    species: string;
    breed?: string;
};

export type MockClient = {
    id: string;
    phone: string;
    name: string;
    email: string;
    pets: Pet[];
};

export type PetSelection = {
    mode: 'existing' | 'new';
    petId?: string;
    petName: string;
    petSpecies: string;
};

export type BookingFormState = {
    step: BookingStep;
    serviceId: string | null;
    date: string | null;
    slotId: string | null;
    phone: string;
    client: MockClient | null;
    clientLookupDone: boolean;
    petSelection: PetSelection;
    clientName: string;
    clientEmail: string;
};
