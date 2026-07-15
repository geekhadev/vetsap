import { useMemo } from 'react';
import ClinicalTemplatesController from '@/actions/App/Http/Controllers/Medic/ClinicalTemplatesController';
import type { ClinicalTemplate } from '../types';

type UseClinicalTemplateFormOptions = {
    entity: ClinicalTemplate | null;
};

export function useClinicalTemplateForm({ entity }: UseClinicalTemplateFormOptions) {
    const isEdit = entity !== null;
    const headTitle = isEdit ? 'Editar plantilla' : 'Nueva plantilla';
    const description = isEdit
        ? 'Modifica los campos y ajustes de la plantilla.'
        : 'Define los campos que aparecerán en la atención clínica.';

    const formProps = useMemo(() => {
        if (isEdit && entity) {
            return ClinicalTemplatesController.update.form({ clinicalTemplate: entity.id });
        }

        return ClinicalTemplatesController.store.form();
    }, [isEdit, entity]);

    return {
        isEdit,
        headTitle,
        description,
        formProps,
    };
}
