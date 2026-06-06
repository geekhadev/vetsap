import type { AppointmentStatusColorValue } from '@/lib/appointment-status-colors';

export type AppointmentStatusColorBadgeProps = {
    color: AppointmentStatusColorValue;
    label: string;
    className?: string;
};
