import type { AppointmentStatusColorValue } from '@/lib/appointment-status-colors';

export type FormAppointmentStatusColorPickerProps = {
    name: string;
    defaultValue?: AppointmentStatusColorValue;
    label?: string;
    required?: boolean;
    error?: string;
    containerClassName?: string;
};
