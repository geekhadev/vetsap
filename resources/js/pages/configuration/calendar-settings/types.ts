export type CalendarSettingsFormState = {
    starts_at: string;
    ends_at: string;
    time_block_minutes: string;
    default_service_id: string;
    doctor_notifications: {
        on_create: boolean;
        on_confirm: boolean;
        on_cancel: boolean;
        on_reschedule: boolean;
    };
    client_notifications: {
        on_create: boolean;
        on_confirm: boolean;
        on_cancel: boolean;
        on_reschedule: boolean;
        on_payment_issued: boolean;
        on_invoice_issued: boolean;
        on_medical_record_after_visit: boolean;
        on_prescription_after_visit: boolean;
    };
};

export type CalendarSettingsServiceOption = {
    id: string;
    label: string;
};

export type CalendarSettingsIndexPageProps = {
    companyMissing: boolean;
    settings: CalendarSettingsFormState | null;
    services: CalendarSettingsServiceOption[];
};
