import { useMemo } from 'react';
import PaymentTypesController from '@/actions/App/Http/Controllers/Shared/PaymentTypesController';
import type { PaymentType } from '../types';

export function usePaymentTypeForm(paymentType: PaymentType | null) {
    const isEdit = paymentType !== null;

    const formProps = useMemo(() => {
        if (isEdit && paymentType) {
            return PaymentTypesController.update.form({
                payment_type: paymentType.id,
            });
        }

        return PaymentTypesController.store.form();
    }, [isEdit, paymentType]);

    const headTitle = isEdit ? 'Editar tipo de pago' : 'Nuevo tipo de pago';

    return {
        isEdit,
        formProps,
        headTitle,
    };
}
