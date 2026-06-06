import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { SII_CAFS_INDEX_INERTIA_ONLY } from '@/pages/sale/sii-cafs/config';
import type { SiiCafRow } from '@/pages/sale/sii-cafs/types';
import { destroy } from '@/routes/sale/sii-cafs';

export function useSiiCafsIndex() {
    const { deleteRow } = useTabledataDeleteRow<SiiCafRow>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmMessage: (row) =>
            `¿Eliminar el CAF SII del rango ${row.folio_from}–${row.folio_to}? Esta acción no se puede deshacer.`,
        only: SII_CAFS_INDEX_INERTIA_ONLY,
    });

    return { deleteRow };
}
