import { useForm } from '@inertiajs/react';
import VaccinationProtocolsController from '@/actions/App/Http/Controllers/Medic/VaccinationProtocolsController';
import type {
    ProtocolItemFormRow,
    VaccinationProtocol,
} from '../types';
import { emptyProtocolItemRow, itemsFromProtocol } from '../types';

export type VaccinationProtocolFormData = {
    name: string;
    species_id: string;
    description: string;
    version: number;
    is_active: boolean;
    items: Array<{
        product_id: string;
        schedule_type: string;
        week_number: number | null;
        min_age_weeks: number | null;
        max_age_weeks: number | null;
        interval_months: number | null;
        series_key: string | null;
    }>;
};

function toPayloadItems(rows: ProtocolItemFormRow[]) {
    return rows.map((row) => ({
        product_id: row.product_id,
        schedule_type: row.schedule_type,
        week_number:
            row.schedule_type === 'from_birth_weeks' && row.week_number !== ''
                ? Number(row.week_number)
                : null,
        min_age_weeks:
            row.schedule_type === 'unique' && row.min_age_weeks !== ''
                ? Number(row.min_age_weeks)
                : null,
        max_age_weeks:
            row.schedule_type === 'unique' && row.max_age_weeks !== ''
                ? Number(row.max_age_weeks)
                : null,
        interval_months:
            row.schedule_type === 'periodic' && row.interval_months !== ''
                ? Number(row.interval_months)
                : null,
        series_key:
            row.schedule_type !== 'unique' && row.series_key.trim() !== ''
                ? row.series_key.trim()
                : null,
    }));
}

export function useVaccinationProtocolForm(entity: VaccinationProtocol | null) {
    const isEdit = entity !== null;
    const currentVersion = entity?.version ?? 1;
    const headTitle = isEdit ? 'Nueva versión del protocolo' : 'Nuevo protocolo';
    const description = isEdit
        ? `Se creará una nueva versión a partir de la v${currentVersion}. La versión actual quedará inactiva y los planes ya asignados no cambian.`
        : 'Define un protocolo por especie con productos tipo Vacunas.';

    const form = useForm<VaccinationProtocolFormData>({
        name: entity?.name ?? '',
        species_id: entity?.species_id ?? '',
        description: entity?.description ?? '',
        version: currentVersion,
        is_active: entity?.is_active ?? true,
        items: toPayloadItems(itemsFromProtocol(entity?.items)),
    });

    function submit(itemRows: ProtocolItemFormRow[], onSuccess: () => void) {
        const payload = {
            name: form.data.name,
            species_id: form.data.species_id,
            description: form.data.description,
            is_active: form.data.is_active,
            items: toPayloadItems(itemRows),
            ...(isEdit ? {} : { version: 1 }),
        };

        form.transform(() => payload);

        if (isEdit && entity) {
            form.put(VaccinationProtocolsController.update.url(entity.id), {
                preserveScroll: true,
                onSuccess,
            });
        } else {
            form.post(VaccinationProtocolsController.store.url(), {
                preserveScroll: true,
                onSuccess,
            });
        }
    }

    return {
        isEdit,
        headTitle,
        description,
        currentVersion,
        form,
        emptyProtocolItemRow,
        submit,
    };
}
