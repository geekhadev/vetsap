import { ConfirmDialog } from '@/components/custom/confirm-dialog';
import { FormDialogFooter } from '@/components/custom/form-dialog-footer';
import { FormTextInput } from '@/components/custom/form-text-input';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import { useCustomerPortalUserForm } from '@/pages/sale/customers/hooks/use-portal-user-form';
import type { Customer } from '@/pages/sale/customers/types';

type CustomerPortalUserFormProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customer: Customer | null;
};

type PortalUserFormFields = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export function CustomerPortalUserForm({
    open,
    onOpenChange,
    customer,
}: CustomerPortalUserFormProps) {
    const {
        isEdit,
        formProps,
        headTitle,
        description,
        requestDetach,
        confirmDetach,
        confirmDetachOpen,
        setConfirmDetachOpen,
        isDetaching,
    } = useCustomerPortalUserForm(customer, () => onOpenChange(false));

    if (customer === null) {
        return null;
    }

    return (
        <>
            <InertiaFormDialog<PortalUserFormFields>
                open={open}
                onOpenChange={onOpenChange}
                title={headTitle}
                description={description}
                formKey={customer.id}
                inertiaForm={{ ...formProps }}
            >
                {({ processing, errors }) => (
                    <>
                        <FormTextInput
                            label="Nombre"
                            required
                            placeholder="Nombre del usuario"
                            error={errors.name}
                            inputProps={{
                                id: 'customer-portal-user-name',
                                name: 'name',
                                maxLength: 255,
                                defaultValue: customer.user?.name ?? customer.name,
                            }}
                        />

                        <FormTextInput
                            label="Email"
                            required
                            placeholder="correo@ejemplo.cl"
                            error={errors.email}
                            inputProps={{
                                id: 'customer-portal-user-email',
                                name: 'email',
                                type: 'email',
                                maxLength: 255,
                                defaultValue:
                                    customer.user?.email ?? customer.email ?? '',
                            }}
                        />

                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormTextInput
                                label={
                                    isEdit
                                        ? 'Nueva contraseña'
                                        : 'Contraseña'
                                }
                                required={!isEdit}
                                placeholder={
                                    isEdit
                                        ? 'Dejar en blanco para no cambiar'
                                        : 'Contraseña de acceso'
                                }
                                error={errors.password}
                                inputProps={{
                                    id: 'customer-portal-user-password',
                                    name: 'password',
                                    type: 'password',
                                    autoComplete: 'new-password',
                                }}
                            />

                            <FormTextInput
                                label="Confirmar contraseña"
                                required={!isEdit}
                                placeholder="Repite la contraseña"
                                error={errors.password_confirmation}
                                inputProps={{
                                    id: 'customer-portal-user-password_confirmation',
                                    name: 'password_confirmation',
                                    type: 'password',
                                    autoComplete: 'new-password',
                                }}
                            />
                        </div>

                        <FormDialogFooter
                            onCancel={() => onOpenChange(false)}
                            onClear={isEdit ? requestDetach : undefined}
                            clearLabel="Desvincular usuario"
                            processing={processing || isDetaching}
                            clearDisabled={processing || isDetaching}
                            submitDisabled={processing || isDetaching}
                            isEdit={isEdit}
                            submitLabel={
                                isEdit ? 'Guardar usuario' : 'Crear usuario'
                            }
                        />
                    </>
                )}
            </InertiaFormDialog>

            <ConfirmDialog
                open={confirmDetachOpen}
                onOpenChange={(nextOpen) => {
                    if (!isDetaching) {
                        setConfirmDetachOpen(nextOpen);
                    }
                }}
                title="¿Desvincular usuario del portal?"
                description={
                    customer.user
                        ? `Se desvinculará a «${customer.user.email}» de este cliente. Si no está ligado a otro cliente, el usuario se eliminará.`
                        : ''
                }
                confirmLabel={isDetaching ? 'Desvinculando…' : 'Desvincular'}
                confirmVariant="destructive"
                confirming={isDetaching}
                onConfirm={confirmDetach}
            />
        </>
    );
}
