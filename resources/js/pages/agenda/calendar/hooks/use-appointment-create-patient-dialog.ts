import { router, useHttp } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import AppointmentPatientsController from '@/actions/App/Http/Controllers/Agenda/AppointmentPatientsController';
import {
    buildEmptyAppointmentCreatePatientFormState,
    normalizeAppointmentDocumentNumber,
} from '@/pages/agenda/calendar/types';
import type {
    AppointmentCreatePatientFormState,
    AppointmentCustomerLookupStatus,
    AppointmentFormPatientOption,
    AppointmentLookupCustomer,
} from '@/pages/agenda/calendar/types';

const DOCUMENT_LOOKUP_DEBOUNCE_MS = 300;

type LookupResponse = {
    customer: AppointmentLookupCustomer | null;
};

type StoreResponse = {
    patient: AppointmentFormPatientOption;
};

type UseAppointmentCreatePatientDialogArgs = {
    onCreated: (patient: AppointmentFormPatientOption) => void;
};

export function useAppointmentCreatePatientDialog({
    onCreated,
}: UseAppointmentCreatePatientDialogArgs) {
    const [form, setForm] = useState<AppointmentCreatePatientFormState>(
        buildEmptyAppointmentCreatePatientFormState,
    );
    const [matchedCustomer, setMatchedCustomer] =
        useState<AppointmentLookupCustomer | null>(null);
    const [remoteLookupStatus, setRemoteLookupStatus] = useState<
        Exclude<AppointmentCustomerLookupStatus, 'idle'>
    >('looking');
    const lookupRequestIdRef = useRef(0);

    const lookupHttp = useHttp({
        document_type: 'rut',
        document_number: '',
    });
    const createHttp = useHttp({
        customer_id: '',
        document_type: 'rut',
        document_number: '',
        customer_name: '',
        phone: '',
        name: '',
        record_number: '',
        species_id: '',
        sex: '',
    });
    const lookupHttpRef = useRef(lookupHttp);

    useEffect(() => {
        lookupHttpRef.current = lookupHttp;
    }, [lookupHttp]);

    const documentReady =
        normalizeAppointmentDocumentNumber(form.documentNumber).length >= 3;

    const lookupStatus: AppointmentCustomerLookupStatus = documentReady
        ? remoteLookupStatus
        : 'idle';

    const resolvedMatchedCustomer = documentReady ? matchedCustomer : null;

    const updateField = useCallback(
        <K extends keyof AppointmentCreatePatientFormState>(
            key: K,
            value: AppointmentCreatePatientFormState[K],
        ) => {
            setForm((current) => ({ ...current, [key]: value }));
            createHttp.clearErrors();
        },
        [createHttp],
    );

    useEffect(() => {
        if (!documentReady) {
            return;
        }

        const currentRequestId = ++lookupRequestIdRef.current;

        const timeoutId = window.setTimeout(() => {
            setRemoteLookupStatus('looking');

            void (async () => {
                try {
                    lookupHttpRef.current.transform(() => ({
                        document_type: form.documentType,
                        document_number: form.documentNumber.trim(),
                    }));

                    const response = (await lookupHttpRef.current.get(
                        AppointmentPatientsController.lookupCustomer.url(),
                    )) as LookupResponse;

                    if (currentRequestId !== lookupRequestIdRef.current) {
                        return;
                    }

                    if (response.customer) {
                        setMatchedCustomer(response.customer);
                        setRemoteLookupStatus('found');
                        setForm((current) => ({
                            ...current,
                            customerId: response.customer!.id,
                            customerName: response.customer!.name,
                            phone: response.customer!.phone ?? '',
                        }));

                        return;
                    }

                    setMatchedCustomer(null);
                    setRemoteLookupStatus('not_found');
                    setForm((current) => ({
                        ...current,
                        customerId: '',
                        customerName:
                            current.customerId !== ''
                                ? ''
                                : current.customerName,
                    }));
                } catch {
                    if (currentRequestId !== lookupRequestIdRef.current) {
                        return;
                    }

                    setMatchedCustomer(null);
                    setRemoteLookupStatus('not_found');
                }
            })();
        }, DOCUMENT_LOOKUP_DEBOUNCE_MS);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [documentReady, form.documentNumber, form.documentType]);

    const canSubmit = useMemo(() => {
        if (!documentReady) {
            return false;
        }

        if (form.patientName.trim() === '') {
            return false;
        }

        if (form.speciesId === '' || form.sex === '') {
            return false;
        }

        if (lookupStatus === 'found') {
            return resolvedMatchedCustomer !== null;
        }

        if (lookupStatus === 'not_found') {
            return form.customerName.trim() !== '';
        }

        return false;
    }, [
        documentReady,
        form,
        lookupStatus,
        resolvedMatchedCustomer,
    ]);

    const submit = useCallback(async () => {
        if (!canSubmit || createHttp.processing) {
            return;
        }

        createHttp.transform(() => ({
            customer_id: resolvedMatchedCustomer?.id ?? '',
            document_type: form.documentType,
            document_number: form.documentNumber.trim(),
            customer_name: form.customerName.trim(),
            phone: form.phone.trim(),
            name: form.patientName.trim(),
            record_number: form.recordNumber.trim(),
            species_id: form.speciesId,
            sex: form.sex,
        }));

        try {
            const response = (await createHttp.post(
                AppointmentPatientsController.store.url(),
            )) as StoreResponse;

            onCreated(response.patient);
            toast.success('Paciente creado correctamente.');
            router.reload({
                only: ['formOptions', 'appointmentFormOptions'],
            });
        } catch {
            // Errores de validación quedan en createHttp.errors
        }
    }, [
        canSubmit,
        createHttp,
        form,
        onCreated,
        resolvedMatchedCustomer,
    ]);

    return {
        form,
        lookupStatus,
        matchedCustomer: resolvedMatchedCustomer,
        canSubmit,
        processing: createHttp.processing,
        errors: createHttp.errors,
        updateField,
        submit,
    };
}
