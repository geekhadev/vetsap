export type CalendarSettingsFormState = {
    startsAt: string;
    endsAt: string;
    timeBlockMinutes: string;
    defaultServiceId: string;
    doctorNotifications: {
        onCreate: boolean;
        onConfirm: boolean;
        onCancel: boolean;
        onReschedule: boolean;
    };
    clientNotifications: {
        onCreate: boolean;
        onConfirm: boolean;
        onCancel: boolean;
        onReschedule: boolean;
        onPaymentIssued: boolean;
        onInvoiceIssued: boolean;
        onMedicalRecordAfterVisit: boolean;
        onPrescriptionAfterVisit: boolean;
    };
};
