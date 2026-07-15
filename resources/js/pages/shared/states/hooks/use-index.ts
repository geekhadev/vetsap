import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/shared/states';
import type { State } from '../types';

export type { StatesIndexPageProps } from '@/pages/shared/states/config';

export function useStatesIndex() {
    const { deleteRow, deleteConfirmDialog } = useTabledataDeleteRow<State>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmTitle: () => '¿Eliminar el estado?',
        confirmDescription: (row) =>
            `Se eliminará el estado «${row.name}».Esta acción no se puede deshacer.`,
    });

    return { deleteRow, deleteConfirmDialog };
}
