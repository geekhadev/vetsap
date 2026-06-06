import { useMemo } from 'react';
import CustomersController from '@/actions/App/Http/Controllers/Sale/CustomersController';
import type { Customer } from '../types';

export function useCustomerForm(entity: Customer | null) {
    const isEdit = entity !== null;
    const headTitle = isEdit ? 'Editar cliente' : 'Nuevo cliente';
    const description = isEdit
        ? 'Modifica al cliente. El documento no se puede cambiar.'
        : 'Completa los datos de identificación y contacto del cliente.';

    const formProps = useMemo(() => {
        if (isEdit && entity) {
            return CustomersController.update.form({ customer: entity.id });
        }

        return CustomersController.store.form();
    }, [isEdit, entity]);

    return {
        isEdit,
        headTitle,
        description,
        formProps,
    };
}
