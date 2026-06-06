export type ClinicCompany = {
    id: string;
    name: string;
    slug: string;
    email: string | null;
    phone: string | null;
    address: string | null;
};

export type ClinicSettings = Record<string, string | null>;

import type { PublicBookingSchedulePayload } from './appointment/types';

export type ClinicShowProps = {
    company: ClinicCompany;
    settings: ClinicSettings;
    bookingSchedule: PublicBookingSchedulePayload;
    canEdit: boolean;
};
