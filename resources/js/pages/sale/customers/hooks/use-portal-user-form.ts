import { router } from '@inertiajs/react';
import { useCallback, useMemo, useState } from 'react';
import CustomersController from '@/actions/App/Http/Controllers/Sale/CustomersController';
import type { Customer } from '../types';

export function useCustomerPortalUserForm(
    customer: Customer | null,
    onDetached?: () => void,
) {
    const [isDetaching, setIsDetaching] = useState(false);
    const [confirmDetachOpen, setConfirmDetachOpen] = useState(false);

    const isEdit = customer?.user != null;

    const formProps = useMemo(() => {
        if (customer === null) {
            return CustomersController.upsertPortalUser.form({ customer: '' });
        }

        return CustomersController.upsertPortalUser.form({
            customer: customer.id,
        });
    }, [customer]);

    const headTitle = customer
        ? isEdit
            ? `Usuario portal de ${customer.name}`
            : `Crear usuario portal — ${customer.name}`
        : 'Usuario del portal';

    const description = isEdit
        ? 'Actualiza el acceso del cliente al portal. Deja la contraseña en blanco si no quieres cambiarla.'
        : 'Crea una cuenta de tipo cliente vinculada a este registro para que pueda entrar al portal.';

    const requestDetach = useCallback(() => {
        if (customer === null || !isEdit) {
            return;
        }

        setConfirmDetachOpen(true);
    }, [customer, isEdit]);

    const confirmDetach = useCallback(() => {
        if (customer === null) {
            return;
        }

        router.delete(
            CustomersController.destroyPortalUser.url({
                customer: customer.id,
            }),
            {
                preserveScroll: true,
                onStart: () => setIsDetaching(true),
                onFinish: () => setIsDetaching(false),
                onSuccess: () => {
                    setConfirmDetachOpen(false);
                    onDetached?.();
                },
            },
        );
    }, [customer, onDetached]);

    return {
        isEdit,
        formProps,
        headTitle,
        description,
        requestDetach,
        confirmDetach,
        confirmDetachOpen,
        setConfirmDetachOpen,
        isDetaching,
    };
}
