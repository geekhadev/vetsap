/**
 * Índice de tipos de documento tributario SII: borrado fuera de `TabledataProvider`.
 */
import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/shared/sii-tax-document-types';
import type { SiiTaxDocumentType } from '../types';

export type { SiiTaxDocumentTypesIndexPageProps } from '@/pages/shared/sii-tax-document-types/config';

export function useSiiTaxDocumentTypesIndex() {
    const { deleteRow, deleteConfirmDialog } = useTabledataDeleteRow<SiiTaxDocumentType>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmTitle: () => '¿Eliminar el tipo de documento?',
        confirmDescription: (row) =>
            `Se eliminará el tipo de documento «${row.name}» (código ${row.code}). Esta acción no se puede deshacer.`,
    });

    return { deleteRow, deleteConfirmDialog };
}
