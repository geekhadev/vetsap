import { useMemo } from 'react';
import DocumentTemplatesController from '@/actions/App/Http/Controllers/Medic/DocumentTemplatesController';
import type { DocumentTemplate } from '../types';

export function useDocumentTemplateForm(entity: DocumentTemplate | null) {
    const isEdit = entity !== null;
    const headTitle = isEdit ? 'Editar plantilla' : 'Nueva plantilla';
    const description = isEdit
        ? 'Actualiza el título y el contenido. Usa @ para insertar variables.'
        : 'Define el título y el contenido del documento. Usa @ para insertar variables.';

    const formProps = useMemo(() => {
        if (isEdit && entity) {
            return DocumentTemplatesController.update.form({
                document_template: entity.id,
            });
        }

        return DocumentTemplatesController.store.form();
    }, [isEdit, entity]);

    return {
        isEdit,
        headTitle,
        description,
        formProps,
    };
}
