import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/medic/document-templates';
import type { DocumentTemplate } from '../types';

export type { DocumentTemplatesIndexPageProps } from '@/pages/medic/document-templates/config';

export function useDocumentTemplatesIndex() {
    const { deleteRow, deleteConfirmDialog } =
        useTabledataDeleteRow<DocumentTemplate>({
            getDestroyUrl: (row) => destroy.url(row.id),
            confirmTitle: () => '¿Eliminar la plantilla?',
            confirmDescription: (row) =>
                `Se eliminará la plantilla «${row.title}». Esta acción no se puede deshacer.`,
        });

    return { deleteRow, deleteConfirmDialog };
}
