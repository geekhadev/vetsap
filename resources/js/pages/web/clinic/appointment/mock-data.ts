import { generateDayBlockStarts } from './schedule-blocks';
import type { AppointmentService, MockClient, ScheduleBlockConfig, Veterinarian, VeterinarianBlock } from './types';

export const MOCK_BLOCK_CONFIG: ScheduleBlockConfig = {
    blockMinutes: 30,
};

export const MOCK_PET_SPECIES = [
    'Perro',
    'Gato',
    'Ave',
    'Conejo',
    'Hámster',
    'Cobayo',
    'Hurón',
    'Reptil',
    'Pez',
    'Otro',
] as const;

function service(
    id: string,
    name: string,
    description: string,
    blockCount: number,
): AppointmentService {
    return {
        id,
        name,
        description,
        blockCount,
        durationMinutes: blockCount * MOCK_BLOCK_CONFIG.blockMinutes,
    };
}

export const MOCK_SERVICES: AppointmentService[] = [
    service('general', 'Medicina general', 'Consulta clínica y evaluación integral.', 1),
    service('checkup', 'Control de salud', 'Revisión periódica y plan preventivo.', 1),
    service('vaccination', 'Vacunación', 'Esquema de vacunas según edad y especie.', 1),
    service('deworming', 'Desparasitación', 'Tratamiento interno y externo.', 1),
    service('nutrition', 'Consulta nutricional', 'Alimentación y control de peso.', 1),
    service('postop', 'Control postoperatorio', 'Seguimiento después de un procedimiento.', 1),
    service('blood-exam', 'Examen de sangre', 'Hemograma y screening básico.', 1),
    service('biochemistry', 'Perfil bioquímico', 'Panel metabólico completo.', 2),
    service('xray', 'Radiografía', 'Estudio imagenológico.', 1),
    service('ultrasound', 'Ecografía', 'Evaluación por imagen en tiempo real.', 2),
    service('sample-collection', 'Toma de muestras', 'Extracción para laboratorio externo.', 1),
    service('urinalysis', 'Examen de orina', 'Análisis completo de orina.', 1),
    service('fecal-exam', 'Examen coprológico', 'Detección de parásitos intestinales.', 1),
    service('ecg', 'Electrocardiograma', 'Evaluación cardíaca básica.', 1),
    service('minor-surgery', 'Cirugía menor', 'Procedimientos ambulatorios.', 2),
    service('major-surgery', 'Cirugía mayor', 'Intervención con mayor tiempo quirúrgico.', 4),
    service('castration', 'Castración / esterilización', 'Procedimiento programado.', 2),
    service('dental', 'Odontología', 'Limpieza dental y evaluación oral.', 2),
    service('grooming', 'Peluquería e higiene', 'Baño, corte y arreglo general.', 2),
    service('medicated-bath', 'Baño medicado', 'Tratamiento dermatológico tópico.', 2),
    service('nail-trim', 'Corte de uñas', 'Manejo rápido de uñas.', 1),
    service('hospitalization-day', 'Hospitalización (día)', 'Internación y monitoreo diurno.', 4),
    service('hospitalization-night', 'Hospitalización (24 h)', 'Internación con cuidados continuos.', 8),
    service('fluid-therapy', 'Fluidoterapia', 'Administración de fluidos y observación.', 2),
    service('emergency', 'Urgencias', 'Atención prioritaria el mismo día.', 2),
];

export const MOCK_VETERINARIANS: Veterinarian[] = [
    { id: 'vet-1', name: 'Dra. Camila Rojas', specialty: 'Medicina general' },
    { id: 'vet-2', name: 'Dr. Andrés Muñoz', specialty: 'Cirugía' },
    { id: 'vet-3', name: 'Dra. Paula Soto', specialty: 'Odontología' },
];

export const MOCK_CLIENTS: MockClient[] = [
    {
        id: 'client-1',
        phone: '912345678',
        name: 'María González',
        email: 'maria.gonzalez@email.cl',
        pets: [
            { id: 'pet-1', name: 'Luna', species: 'Perro', breed: 'Labrador' },
            { id: 'pet-2', name: 'Michi', species: 'Gato', breed: 'Mestizo' },
        ],
    },
    {
        id: 'client-2',
        phone: '987654321',
        name: 'Carlos Pérez',
        email: 'carlos.perez@email.cl',
        pets: [{ id: 'pet-3', name: 'Rocky', species: 'Perro', breed: 'Bulldog' }],
    },
];

const DAY_BLOCK_STARTS = generateDayBlockStarts('09:00', '18:30', MOCK_BLOCK_CONFIG.blockMinutes);

function formatDateKey(date: Date): string {
    return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
    const next = new Date(date);
    next.setDate(next.getDate() + days);

    return next;
}

function isVetBlockAvailable(
    veterinarianId: string,
    dateKey: string,
    blockIndex: number,
    dayOffset: number,
): boolean {
    void dateKey;

    const sharedShowcaseBlocks = [0, 2, 4, 8, 12, 14];

    if (sharedShowcaseBlocks.includes(blockIndex) && dayOffset % 3 !== 2) {
        return true;
    }

    const seed = (veterinarianId.charCodeAt(4) + blockIndex * 3 + dayOffset * 7) % 11;

    if (seed === 0 || seed === 1) {
        return false;
    }

    return true;
}

/** Genera la grilla base de bloques por médico (mock de configuración de agenda). */
export function generateMockVeterinarianBlocks(daysAhead = 14): VeterinarianBlock[] {
    const blocks: VeterinarianBlock[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let dayOffset = 0; dayOffset < daysAhead; dayOffset += 1) {
        const date = addDays(today, dayOffset);
        const dayOfWeek = date.getDay();

        if (dayOfWeek === 0) {
            continue;
        }

        const dateKey = formatDateKey(date);

        MOCK_VETERINARIANS.forEach((veterinarian) => {
            DAY_BLOCK_STARTS.forEach((startTime, blockIndex) => {
                blocks.push({
                    date: dateKey,
                    veterinarianId: veterinarian.id,
                    blockIndex,
                    startTime,
                    available: isVetBlockAvailable(veterinarian.id, dateKey, blockIndex, dayOffset),
                });
            });
        });
    }

    return blocks;
}

export function normalizePhone(phone: string): string {
    return phone.replace(/\D/g, '').slice(-9);
}

export function findClientByPhone(phone: string): MockClient | null {
    const normalized = normalizePhone(phone);

    if (normalized.length < 9) {
        return null;
    }

    return MOCK_CLIENTS.find((client) => client.phone === normalized) ?? null;
}

export function getVeterinarianById(id: string): Veterinarian | undefined {
    return MOCK_VETERINARIANS.find((vet) => vet.id === id);
}

export function getServiceById(id: string): AppointmentService | undefined {
    return MOCK_SERVICES.find((service) => service.id === id);
}
