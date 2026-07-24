import { useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef } from 'react';
import type {
    InventorySettingsFormState,
    InventorySettingsIndexPageProps,
} from '@/pages/configuration/inventory-settings/types';
import { update as updateInventorySettings } from '@/routes/configuration/inventory-settings';

const AUTOSAVE_MS = 300;

const EMPTY_FORM_STATE: InventorySettingsFormState = {
    validate_stock_on_sales: true,
};

function serializeSettings(data: InventorySettingsFormState): string {
    return JSON.stringify(data);
}

export function useInventorySettingsForm() {
    const { settings } = usePage<InventorySettingsIndexPageProps>().props;

    const defaults = useMemo(
        () => settings ?? EMPTY_FORM_STATE,
        [settings],
    );

    const form = useForm<InventorySettingsFormState>(defaults);

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

            form.put(updateInventorySettings.url(), {
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
