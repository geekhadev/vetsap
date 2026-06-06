import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import { destroy } from '@/routes/shared/states';
import type { State } from '../types';

export type { StatesIndexPageProps } from '@/pages/shared/states/config';

export function useStatesIndex() {
    const { deleteRow } = useTabledataDeleteRow<State>({
        getDestroyUrl: (row) => destroy.url(row.id),
        confirmMessage: (row) => `¿Eliminar el estado «${row.name}»?`,
    });

    return { deleteRow };
}
