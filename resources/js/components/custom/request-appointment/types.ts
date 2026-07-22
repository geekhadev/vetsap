import type {
    PublicBookingSchedule,
    PublicBookingSchedulePayload,
} from '@/pages/web/clinic/appointment/types';

export type CustomerAppointmentPetOption = {
    id: string;
    name: string;
    photo_url: string | null;
    species: string | null;
};

export type CustomerAppointmentFormOptionsPayload = {
    pets: CustomerAppointmentPetOption[];
    schedule: PublicBookingSchedulePayload;
};

export type CustomerAppointmentFormOptions = {
    pets: CustomerAppointmentPetOption[];
    schedule: PublicBookingSchedule;
};

export type CustomerAppointmentStorePayload = {
    patient_id: string;
    service_id: string;
    doctor_id: string;
    appointment_date: string;
    starts_at_time: string;
    notes: string;
};
