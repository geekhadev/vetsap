import { FilePlus } from 'lucide-react';

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
