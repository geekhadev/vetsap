import { useMemo } from 'react';
import SuppliersController from '@/actions/App/Http/Controllers/Purchase/SuppliersController';
import type { Supplier } from '../types';

export function useSupplierForm(entity: Supplier | null) {
    const isEdit = entity !== null;
    const headTitle = isEdit ? 'Editar proveedor' : 'Nuevo proveedor';
    const description = isEdit
        ? 'Modifica al proveedor. El documento no se puede cambiar.'
        : 'Completa los datos de identificación y contacto del proveedor.';

    const formProps = useMemo(() => {
        if (isEdit && entity) {
            return SuppliersController.update.form({ supplier: entity.id });
        }

        return SuppliersController.store.form();
    }, [isEdit, entity]);

    return {
        isEdit,
        headTitle,
        description,
        formProps,
    };
}
