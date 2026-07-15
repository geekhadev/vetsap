import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/medic/clinical-attentions';
import type { ClinicalAttention } from '../types';

export function useClinicalAttentionsIndex() {
    const { deleteRow } = useTabledataDeleteRow<ClinicalAttention>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmMessage: (row) =>
            `¿Eliminar la atención de «${row.patient?.name ?? 'este paciente'}»? Esta acción no se puede deshacer.`,
    });

    return { deleteRow };
}
