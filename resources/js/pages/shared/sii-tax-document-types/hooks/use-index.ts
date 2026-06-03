/**
 * Índice de tipos de documento tributario SII: borrado fuera de `TabledataProvider`.
 */
import { router } from '@inertiajs/react';
import { useCallback } from 'react';
import { TABLEDATA_LIST_INERTIA_ONLY } from '@/components/custom/tabledata';
import { destroy } from '@/routes/shared/sii-tax-document-types';
import type { SiiTaxDocumentType } from '../types';

export type { SiiTaxDocumentTypesIndexPageProps } from '@/pages/shared/sii-tax-document-types/config';

export function useSiiTaxDocumentTypesIndex() {
    const deleteRow = useCallback((row: SiiTaxDocumentType) => {
        if (
            !window.confirm(
                `¿Eliminar el tipo de documento «${row.name}» (código ${row.code})?`,
            )
        ) {
            return;
        }

        router.delete(destroy.url(row.id), {
            preserveScroll: true,
            only: [...TABLEDATA_LIST_INERTIA_ONLY],
        });
    }, []);

    return {
        deleteRow,
    };
}
