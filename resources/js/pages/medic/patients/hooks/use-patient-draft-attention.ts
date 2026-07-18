import { router, useHttp } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import PatientsController from '@/actions/App/Http/Controllers/Medic/PatientsController';
import type { ClinicalAttention } from '@/pages/medic/clinical-attentions/types';
import type { ClinicalFieldKey } from '@/pages/medic/clinical-templates/types';

const AUTOSAVE_DELAY_MS = 700;

export type DraftAttentionFormState = {
    template_id: string;
    doctor_id: string;
    appointment_id: string | null;
    values: Record<string, string>;
    requested_service_ids: string[];
    document_template_ids: string[];
};

function valuesFromAttention(attention: ClinicalAttention | null): Record<string, string> {
    if (!attention?.values) {
        return {};
    }

    return attention.values.reduce<Record<string, string>>((acc, item) => {
        if (item.value != null && item.value !== '') {
            acc[item.field_key] = String(item.value);
        }

        return acc;
    }, {});
}

function requestedServiceIdsFromAttention(attention: ClinicalAttention | null): string[] {
    return (attention?.requested_services ?? []).map((service) => service.id);
}

function documentTemplateIdsFromAttention(attention: ClinicalAttention | null): string[] {
    return (attention?.document_templates ?? []).map((template) => template.id);
}

function buildInitialState(
    draftAttention: ClinicalAttention | null,
    defaultTemplateId: string,
    defaultDoctorId: string,
): DraftAttentionFormState {
    return {
        template_id: draftAttention?.template_id ?? defaultTemplateId,
        doctor_id: draftAttention?.doctor_id ?? defaultDoctorId,
        appointment_id: draftAttention?.appointment_id ?? null,
        values: valuesFromAttention(draftAttention),
        requested_service_ids: requestedServiceIdsFromAttention(draftAttention),
        document_template_ids: documentTemplateIdsFromAttention(draftAttention),
    };
}

function serializeDraftState(state: DraftAttentionFormState): string {
    return JSON.stringify({
        template_id: state.template_id,
        doctor_id: state.doctor_id,
        appointment_id: state.appointment_id,
        values: state.values,
        requested_service_ids: [...state.requested_service_ids].sort(),
        document_template_ids: [...state.document_template_ids].sort(),
    });
}

function hasMeaningfulDraftData(state: DraftAttentionFormState): boolean {
    if (state.doctor_id.trim() !== '') {
        return true;
    }

    if (state.requested_service_ids.length > 0) {
        return true;
    }

    if (state.document_template_ids.length > 0) {
        return true;
    }

    return Object.values(state.values).some((value) => value.trim() !== '');
}

type UsePatientDraftAttentionOptions = {
    patientId: string;
    draftAttention: ClinicalAttention | null;
    defaultTemplateId: string;
    defaultDoctorId: string;
    onDraftSaved?: () => void;
    onDraftCompleted?: () => void;
};

export function usePatientDraftAttention({
    patientId,
    draftAttention,
    defaultTemplateId,
    defaultDoctorId,
    onDraftSaved,
    onDraftCompleted,
}: UsePatientDraftAttentionOptions) {
    const initialState = buildInitialState(draftAttention, defaultTemplateId, defaultDoctorId);

    const [formState, setFormState] = useState<DraftAttentionFormState>(initialState);
    const [draftId, setDraftId] = useState<string | null>(draftAttention?.id ?? null);
    const [closeErrors, setCloseErrors] = useState<Record<string, string>>({});
    const [closing, setClosing] = useState(false);

    const formStateRef = useRef(formState);
    const isDirtyRef = useRef(false);
    const lastPersistedSnapshotRef = useRef(serializeDraftState(initialState));
    const autosaveHttp = useHttp({
        template_id: '',
        doctor_id: '',
        appointment_id: null as string | null,
        values: {} as Record<string, string>,
        requested_service_ids: [] as string[],
        document_template_ids: [] as string[],
    });

    useEffect(() => {
        formStateRef.current = formState;
    }, [formState]);

    const onDraftSavedRef = useRef(onDraftSaved);
    const onDraftCompletedRef = useRef(onDraftCompleted);

    useEffect(() => {
        onDraftSavedRef.current = onDraftSaved;
    }, [onDraftSaved]);

    useEffect(() => {
        onDraftCompletedRef.current = onDraftCompleted;
    }, [onDraftCompleted]);

    const persistDraft = useCallback(async (): Promise<boolean> => {
        const current = formStateRef.current;

        if (!hasMeaningfulDraftData(current)) {
            return true;
        }

        try {
            autosaveHttp.transform(() => ({
                template_id: current.template_id || null,
                doctor_id: current.doctor_id || null,
                appointment_id: current.appointment_id,
                values: current.values,
                requested_service_ids: current.requested_service_ids,
                document_template_ids: current.document_template_ids,
            }));

            const saved = (await autosaveHttp.put(
                PatientsController.upsertDraftAttention.url(patientId),
            )) as ClinicalAttention;

            const isFirstSave = draftId === null;
            setDraftId(saved.id);
            lastPersistedSnapshotRef.current = serializeDraftState(formStateRef.current);
            isDirtyRef.current = false;
            toast.success('Borrador guardado correctamente.');

            if (isFirstSave) {
                onDraftSavedRef.current?.();
            }

            return true;
        } catch {
            toast.error('No se pudo guardar el borrador.');

            return false;
        }
    }, [autosaveHttp, patientId, draftId]);

    const persistDraftRef = useRef(persistDraft);

    useEffect(() => {
        persistDraftRef.current = persistDraft;
    }, [persistDraft]);

    useEffect(() => {
        if (!isDirtyRef.current) {
            return;
        }

        const snapshot = serializeDraftState(formState);

        if (snapshot === lastPersistedSnapshotRef.current) {
            return;
        }

        const timeout = window.setTimeout(() => {
            void persistDraftRef.current();
        }, AUTOSAVE_DELAY_MS);

        return () => window.clearTimeout(timeout);
    }, [formState]);

    const markDirty = useCallback((updater: (prev: DraftAttentionFormState) => DraftAttentionFormState) => {
        isDirtyRef.current = true;
        setFormState(updater);
    }, []);

    const setTemplateId = useCallback(
        (templateId: string) => {
            markDirty((prev) => ({ ...prev, template_id: templateId }));
        },
        [markDirty],
    );

    const setDoctorId = useCallback(
        (doctorId: string) => {
            markDirty((prev) => ({ ...prev, doctor_id: doctorId }));
        },
        [markDirty],
    );

    const setFieldValue = useCallback(
        (fieldKey: ClinicalFieldKey, value: string) => {
            markDirty((prev) => ({
                ...prev,
                values: { ...prev.values, [fieldKey]: value },
            }));
        },
        [markDirty],
    );

    const setRequestedServiceIds = useCallback(
        (requestedServiceIds: string[]) => {
            markDirty((prev) => ({
                ...prev,
                requested_service_ids: requestedServiceIds,
            }));
        },
        [markDirty],
    );

    const setDocumentTemplateIds = useCallback(
        (documentTemplateIds: string[]) => {
            markDirty((prev) => ({
                ...prev,
                document_template_ids: documentTemplateIds,
            }));
        },
        [markDirty],
    );

    const closeAttention = useCallback(async () => {
        setClosing(true);
        setCloseErrors({});

        if (isDirtyRef.current) {
            const saved = await persistDraftRef.current();

            if (!saved) {
                setClosing(false);

                return;
            }
        }

        router.post(
            PatientsController.closeDraftAttention.url(patientId),
            {
                template_id: formStateRef.current.template_id,
                doctor_id: formStateRef.current.doctor_id,
                appointment_id: formStateRef.current.appointment_id,
                patient_id: patientId,
                values: formStateRef.current.values,
                requested_service_ids: formStateRef.current.requested_service_ids,
                document_template_ids: formStateRef.current.document_template_ids,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setDraftId(null);
                    onDraftCompletedRef.current?.();
                },
                onError: (errors) => {
                    setCloseErrors(errors as Record<string, string>);
                    setClosing(false);
                },
                onFinish: () => setClosing(false),
            },
        );
    }, [patientId]);

    return {
        formState,
        draftId,
        closeErrors,
        closing,
        setTemplateId,
        setDoctorId,
        setFieldValue,
        setRequestedServiceIds,
        setDocumentTemplateIds,
        closeAttention,
    };
}
