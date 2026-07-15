import { router } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import {
    destroyExamResult,
    storeExamResult,
} from '@/actions/App/Http/Controllers/Medic/ClinicalAttentionsController';
import { jsonFetchHeaders } from '@/lib/json-fetch-headers';
import type { AttentionRequestedExam } from '@/pages/medic/patients/types';

type UseAttentionExamUploadOptions = {
    attentionId: string;
    onExamUpdated?: (exam: AttentionRequestedExam) => void;
};

export function useAttentionExamUpload({
    attentionId,
    onExamUpdated,
}: UseAttentionExamUploadOptions) {
    const [busyServiceId, setBusyServiceId] = useState<string | null>(null);

    const refreshTimeline = useCallback(() => {
        router.reload({
            only: ['attentions'],
            preserveScroll: true,
        });
    }, []);

    const uploadExam = useCallback(
        async (serviceId: string, file: File) => {
            setBusyServiceId(serviceId);

            try {
                const body = new FormData();
                body.append('file', file);

                const response = await fetch(
                    storeExamResult.url({
                        clinical_attention: attentionId,
                        service: serviceId,
                    }),
                    {
                        method: 'POST',
                        headers: jsonFetchHeaders(),
                        credentials: 'same-origin',
                        body,
                    },
                );

                const payload = (await response.json().catch(() => null)) as
                    | { exam?: AttentionRequestedExam; message?: string; errors?: Record<string, string[]> }
                    | null;

                if (!response.ok) {
                    const message =
                        payload?.errors?.file?.[0] ??
                        payload?.message ??
                        'No se pudo cargar el examen.';
                    toast.error(message);

                    return;
                }

                if (payload?.exam) {
                    onExamUpdated?.(payload.exam);
                    toast.success('Examen cargado correctamente.');
                    refreshTimeline();
                }
            } catch {
                toast.error('No se pudo cargar el examen.');
            } finally {
                setBusyServiceId(null);
            }
        },
        [attentionId, onExamUpdated, refreshTimeline],
    );

    const removeExam = useCallback(
        async (serviceId: string) => {
            setBusyServiceId(serviceId);

            try {
                const response = await fetch(
                    destroyExamResult.url({
                        clinical_attention: attentionId,
                        service: serviceId,
                    }),
                    {
                        method: 'DELETE',
                        headers: jsonFetchHeaders(),
                        credentials: 'same-origin',
                    },
                );

                const payload = (await response.json().catch(() => null)) as
                    | { exam?: AttentionRequestedExam; message?: string }
                    | null;

                if (!response.ok) {
                    toast.error(payload?.message ?? 'No se pudo eliminar el archivo.');

                    return;
                }

                if (payload?.exam) {
                    onExamUpdated?.(payload.exam);
                    toast.success('Archivo eliminado.');
                    refreshTimeline();
                }
            } catch {
                toast.error('No se pudo eliminar el archivo.');
            } finally {
                setBusyServiceId(null);
            }
        },
        [attentionId, onExamUpdated, refreshTimeline],
    );

    return {
        busyServiceId,
        uploadExam,
        removeExam,
    };
}
