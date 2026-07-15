import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/medic/clinical-templates';
import type { ClinicalTemplate } from '../types';

export function useClinicalTemplatesIndex() {
    const { deleteRow } = useTabledataDeleteRow<ClinicalTemplate>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmMessage: (row) =>
            `¿Eliminar la plantilla «${row.name}»? Las atenciones existentes no se verán afectadas.`,
    });

    return { deleteRow };
}
