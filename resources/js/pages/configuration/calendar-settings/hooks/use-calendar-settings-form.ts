import { useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef } from 'react';
import type {
    CalendarSettingsFormState,
    CalendarSettingsIndexPageProps,
} from '@/pages/configuration/calendar-settings/types';
import { update as updateCalendarSettings } from '@/routes/configuration/calendar-settings';

const AUTOSAVE_MS = 300;

const EMPTY_FORM_STATE: CalendarSettingsFormState = {
    starts_at: '09:00',
    ends_at: '19:00',
    time_block_minutes: '30',
    default_service_id: '',
    doctor_notifications: {
        on_create: false,
        on_confirm: false,
        on_cancel: true,
        on_reschedule: true,
    },
    client_notifications: {
        on_create: true,
        on_confirm: true,
        on_cancel: true,
        on_reschedule: true,
        on_payment_issued: true,
        on_invoice_issued: true,
        on_medical_record_after_visit: true,
        on_prescription_after_visit: true,
    },
};

function serializeSettings(data: CalendarSettingsFormState): string {
    return JSON.stringify(data);
}

export function useCalendarSettingsForm() {
    const { settings } = usePage<CalendarSettingsIndexPageProps>().props;

    const defaults = useMemo(
        () => settings ?? EMPTY_FORM_STATE,
        [settings],
    );

    const form = useForm<CalendarSettingsFormState>(defaults);

    const skipAutosaveRef = useRef(true);
    const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );
    const lastSyncedSerializedRef = useRef(serializeSettings(defaults));

    useEffect(() => {
        const serialized = serializeSettings(form.data);

        if (skipAutosaveRef.current) {
            skipAutosaveRef.current = false;
            lastSyncedSerializedRef.current = serialized;

            return;
        }

        if (serialized === lastSyncedSerializedRef.current) {
            return;
        }

        if (autosaveTimerRef.current !== null) {
            clearTimeout(autosaveTimerRef.current);
        }

        const serializedAtSchedule = serialized;

        autosaveTimerRef.current = setTimeout(() => {
            autosaveTimerRef.current = null;

            form.put(updateCalendarSettings.url(), {
                preserveScroll: true,
                only: ['settings'],
                onSuccess: () => {
                    lastSyncedSerializedRef.current = serializedAtSchedule;
                },
            });
        }, AUTOSAVE_MS);

        return () => {
            if (autosaveTimerRef.current !== null) {
                clearTimeout(autosaveTimerRef.current);
                autosaveTimerRef.current = null;
            }
        };
    }, [form, form.data]);

    return { form };
}
