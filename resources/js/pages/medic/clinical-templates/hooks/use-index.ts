import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/medic/clinical-templates';
import type { ClinicalTemplate } from '../types';

export function useClinicalTemplatesIndex() {
    const { deleteRow, deleteConfirmDialog } = useTabledataDeleteRow<ClinicalTemplate>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmTitle: () => '¿Eliminar la plantilla?',
        confirmDescription: (row) =>
            `Se eliminará la plantilla «${row.name}». Las atenciones existentes no se verán afectadas.`,
    });

    return { deleteRow, deleteConfirmDialog };
}
