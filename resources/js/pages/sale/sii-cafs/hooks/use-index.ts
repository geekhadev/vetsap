/**
 * CAFs SII: borrado fuera de `TabledataProvider`.
 */
import { router } from '@inertiajs/react';
import { useCallback } from 'react';
import { SII_CAFS_INDEX_INERTIA_ONLY } from '@/pages/sale/sii-cafs/config';
import type { SiiCafRow } from '@/pages/sale/sii-cafs/types';
import { destroy } from '@/routes/sale/sii-cafs';

export function useSiiCafsIndex() {
    const deleteRow = useCallback((row: SiiCafRow) => {
        if (
            !window.confirm(
                `¿Eliminar el CAF SII del rango ${row.folio_from}–${row.folio_to}? Esta acción no se puede deshacer.`,
            )
        ) {
            return;
        }

        router.delete(destroy.url(row.id), {
            preserveScroll: true,
            only: [...SII_CAFS_INDEX_INERTIA_ONLY],
        });
    }, []);

    return {
        deleteRow,
    };
}
