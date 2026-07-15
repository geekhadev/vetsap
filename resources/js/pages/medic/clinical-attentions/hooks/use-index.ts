import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/medic/clinical-attentions';
import type { ClinicalAttention } from '../types';

export function useClinicalAttentionsIndex() {
    const { deleteRow, deleteConfirmDialog } = useTabledataDeleteRow<ClinicalAttention>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmTitle: () => '¿Eliminar la atención?',
        confirmDescription: (row) =>
            `Se eliminará la atención de «${row.patient?.name ?? 'este paciente'}». Esta acción no se puede deshacer.`,
    });

    return { deleteRow, deleteConfirmDialog };
}
