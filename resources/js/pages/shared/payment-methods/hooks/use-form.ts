import { useMemo } from 'react';
import PaymentMethodsController from '@/actions/App/Http/Controllers/Shared/PaymentMethodsController';
import type { PaymentMethod } from '../types';

export function usePaymentMethodForm(paymentMethod: PaymentMethod | null) {
    const isEdit = paymentMethod !== null;

    const formProps = useMemo(() => {
        if (isEdit && paymentMethod) {
            return PaymentMethodsController.update.form({
                payment_method: paymentMethod.id,
            });
        }

        return PaymentMethodsController.store.form();
    }, [isEdit, paymentMethod]);

    const headTitle = isEdit ? 'Editar método de pago' : 'Nuevo método de pago';

    return {
        isEdit,
        formProps,
        headTitle,
    };
}
