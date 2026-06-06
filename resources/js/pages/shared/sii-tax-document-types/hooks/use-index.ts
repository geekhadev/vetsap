/**
 * Índice de tipos de documento tributario SII: borrado fuera de `TabledataProvider`.
 */
import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/shared/sii-tax-document-types';
import type { SiiTaxDocumentType } from '../types';

export type { SiiTaxDocumentTypesIndexPageProps } from '@/pages/shared/sii-tax-document-types/config';

export function useSiiTaxDocumentTypesIndex() {
    const { deleteRow } = useTabledataDeleteRow<SiiTaxDocumentType>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmMessage: (row) =>
            `¿Eliminar el tipo de documento «${row.name}» (código ${row.code})?`,
    });

    return { deleteRow };
}
