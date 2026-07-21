import { useTabledataDeleteRow } from '@/hooks/use-tabledata-delete-row';
import type { VaccinationProtocol } from '../types';
import { destroy } from '@/routes/medic/vaccination-protocols';

export type { VaccinationProtocolsIndexPageProps } from '@/pages/medic/vaccination-protocols/config';

export function useVaccinationProtocolsIndex() {
    const { deleteRow, deleteConfirmDialog } =
        useTabledataDeleteRow<VaccinationProtocol>({
            getDestroyUrl: (row) => destroy.url(row.id),
            confirmTitle: () => '¿Eliminar el protocolo?',
            confirmDescription: (row) =>
                `Se eliminará el protocolo «${row.name}». Esta acción no se puede deshacer.`,
        });

    return { deleteRow, deleteConfirmDialog };
}
