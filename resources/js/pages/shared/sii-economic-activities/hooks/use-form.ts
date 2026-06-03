import { useMemo } from 'react';
import SiiEconomicActivitiesController from '@/actions/App/Http/Controllers/Shared/SiiEconomicActivitiesController';
import type { SiiEconomicActivity } from '../types';

export function useSiiEconomicActivityForm(
    siiEconomicActivity: SiiEconomicActivity | null,
) {
    const isEdit = siiEconomicActivity !== null;

    const formProps = useMemo(() => {
        if (isEdit && siiEconomicActivity) {
            return SiiEconomicActivitiesController.update.form({
                sii_economic_activity: siiEconomicActivity.id,
            });
        }

        return SiiEconomicActivitiesController.store.form();
    }, [isEdit, siiEconomicActivity]);

    const headTitle = isEdit
        ? 'Editar actividad económica'
        : 'Nueva actividad económica';

    return {
        isEdit,
        formProps,
        headTitle,
    };
}
