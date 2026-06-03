import { useMemo } from 'react';
import SiiTaxDocumentTypesController from '@/actions/App/Http/Controllers/Shared/SiiTaxDocumentTypesController';
import type { SiiTaxDocumentType } from '../types';

export function useSiiTaxDocumentTypeForm(
    siiTaxDocumentType: SiiTaxDocumentType | null,
) {
    const isEdit = siiTaxDocumentType !== null;

    const formProps = useMemo(() => {
        if (isEdit && siiTaxDocumentType) {
            return SiiTaxDocumentTypesController.update.form({
                sii_tax_document_type: siiTaxDocumentType.id,
            });
        }

        return SiiTaxDocumentTypesController.store.form();
    }, [isEdit, siiTaxDocumentType]);

    const headTitle = isEdit
        ? 'Editar tipo de documento tributario'
        : 'Nuevo tipo de documento tributario';

    return {
        isEdit,
        formProps,
        headTitle,
    };
}
