import { ClipboardPlus, FilePlus, FlaskConical } from 'lucide-react';
import type { PatientEditTabId } from '@/pages/medic/patients/types';

export const PATIENT_EDIT_MAIN_TABS = [
    {
        id: 'historial' as const,
        label: 'Historial clínico',
        icon: ClipboardPlus,
    },
    {
        id: 'examenes' as const,
        label: 'Exámenes',
        icon: FlaskConical,
    },
] satisfies ReadonlyArray<{
    id: Extract<PatientEditTabId, 'historial' | 'examenes'>;
    label: string;
    icon: typeof ClipboardPlus;
}>;

export const PATIENT_DRAFT_ATTENTION_ACTION = {
    id: 'nueva-atencion' as const,
    label: 'Nueva atención',
    draftLabel: 'Atención en borrador',
    icon: FilePlus,
};

export function getDraftAttentionActionLabel(hasDraftAttention: boolean): string {
    return hasDraftAttention
        ? PATIENT_DRAFT_ATTENTION_ACTION.draftLabel
        : PATIENT_DRAFT_ATTENTION_ACTION.label;
}
