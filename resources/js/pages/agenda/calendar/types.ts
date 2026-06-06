import type { CalendarHoliday } from '@/components/custom/full-calendar/types';

export type CalendarAppointmentEvent = {
    id: string;
    title: string;
    subtitle: string;
    start: string;
    end: string;
    status_color: string;
    cancelled?: boolean;
};

export type AppointmentFormDoctorOption = {
    id: string;
    label: string;
    service_ids: string[];
};

export type AppointmentFormServiceOption = {
    id: string;
    label: string;
    duration_minutes: number | null;
    price: string | null;
};

export type AppointmentFormPatientOption = {
    id: string;
    label: string;
    customer_id: string;
    search_text: string;
};

export type AppointmentFormOfficeOption = {
    id: string;
    label: string;
};

export type AppointmentFormOptions = {
    doctors: AppointmentFormDoctorOption[];
    services: AppointmentFormServiceOption[];
    patients: AppointmentFormPatientOption[];
    offices: AppointmentFormOfficeOption[];
};

export type CalendarIndexCan = {
    create: boolean;
    view: boolean;
    update: boolean;
};

export type AppointmentStatusOption = {
    id: string;
    name: string;
    color: string;
};

export type AppointmentDetailPatient = {
    id: string;
    name: string;
    record_number: string;
    microchip_number: string;
    sex: 'male' | 'female' | 'unknown';
    birth_date: string | null;
    age_years: number | null;
    weight_kg: string | null;
    colors: string;
    blood_type: string;
    species_name: string | null;
};

export type AppointmentDetailCustomer = {
    id: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    document_number: string;
};

export type AppointmentDetailStatus = {
    id: string;
    name: string;
    color: string;
    is_terminal: boolean;
};

export type AppointmentDetail = {
    id: string;
    starts_at: string;
    ends_at: string;
    duration_minutes: number;
    price: string | null;
    notes: string | null;
    status: AppointmentDetailStatus;
    patient: AppointmentDetailPatient;
    customer: AppointmentDetailCustomer;
    doctor: { id: string; label: string };
    service: { id: string; name: string };
    office: { id: string; name: string } | null;
};

export type CalendarIndexPageProps = {
    holidays: CalendarHoliday[];
    appointments: CalendarAppointmentEvent[];
    formOptions: AppointmentFormOptions;
    appointmentStatuses: AppointmentStatusOption[];
    can: CalendarIndexCan;
};

export type AppointmentFormDefaults = {
    appointmentDate: string;
    startsAtTime: string;
};

export type AppointmentFormFields = {
    customer_id: string;
    patient_id: string;
    doctor_id: string;
    service_id: string;
    office_id: string;
    appointment_date: string;
    starts_at_time: string;
    notes: string;
};

export type AppointmentFormInitialState = {
    patientId: string;
    customerId: string;
    serviceId: string;
    doctorId: string;
    officeId: string;
    appointmentDate: string;
    startsAtTime: string;
};

export function buildDefaultAppointmentFormDefaults(): AppointmentFormDefaults {
    const now = new Date();
    const appointmentDate = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0'),
    ].join('-');

    const totalMinutes = now.getHours() * 60 + now.getMinutes();
    const roundedMinutes = Math.ceil(totalMinutes / 30) * 30;
    const hours = Math.floor(roundedMinutes / 60) % 24;
    const minutes = roundedMinutes % 60;

    return {
        appointmentDate,
        startsAtTime: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
    };
}

export function resolveDoctorsForService(
    doctors: AppointmentFormDoctorOption[],
    serviceId: string,
): AppointmentFormDoctorOption[] {
    if (serviceId === '') {
        return doctors;
    }

    return doctors.filter((doctor) => doctor.service_ids.includes(serviceId));
}

export function resolveSingleDoctorId(
    doctors: AppointmentFormDoctorOption[],
    serviceId: string,
): string {
    const availableDoctors = resolveDoctorsForService(doctors, serviceId);

    return availableDoctors.length === 1 ? availableDoctors[0].id : '';
}

export function buildInitialAppointmentFormState(
    formOptions: AppointmentFormOptions,
    defaults: AppointmentFormDefaults,
): AppointmentFormInitialState {
    const serviceId =
        formOptions.services.length === 1 ? formOptions.services[0].id : '';

    return {
        patientId: '',
        customerId: '',
        serviceId,
        doctorId: resolveSingleDoctorId(formOptions.doctors, serviceId),
        officeId:
            formOptions.offices.length === 1 ? formOptions.offices[0].id : '',
        appointmentDate: defaults.appointmentDate,
        startsAtTime: defaults.startsAtTime,
    };
}
