import { Save, X } from 'lucide-react';
import { FormSubmitButton } from '@/components/custom/form-submit-button';
import { FormTextInput } from '@/components/custom/form-text-input';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { usePaymentMethodForm } from '@/pages/shared/payment-methods/hooks/use-form';
import type { PaymentMethod } from '@/pages/shared/payment-methods/types';

type FormDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    paymentMethod: PaymentMethod | null;
};

export function FormDialog({
    open,
    onOpenChange,
    paymentMethod,
}: FormDialogProps) {
    const { isEdit, formProps, headTitle } =
        usePaymentMethodForm(paymentMethod);

    const description = isEdit
        ? 'Actualiza el nombre o el código del método de pago.'
        : 'Define un nombre y un código únicos (p. ej. Efectivo / EF).';

    return (
        <InertiaFormDialog<Pick<PaymentMethod, 'name' | 'code'>>
            open={open}
            onOpenChange={onOpenChange}
            title={headTitle}
            description={description}
            formKey={paymentMethod?.id ?? 'create'}
            inertiaForm={{ ...formProps }}
        >
            {({ processing, errors }) => (
                <>
                    <FormTextInput
                        label="Nombre"
                        placeholder="Ej. Transferencia"
                        required
                        error={errors.name}
                        inputProps={{
                            id: 'payment-method-name',
                            name: 'name',
                            maxLength: 255,
                            defaultValue: paymentMethod?.name ?? '',
                        }}
                    />

                    <FormTextInput
                        label="Código"
                        placeholder="Ej. TR"
                        required
                        error={errors.code}
                        inputProps={{
                            id: 'payment-method-code',
                            name: 'code',
                            maxLength: 50,
                            autoComplete: 'off',
                            defaultValue: paymentMethod?.code ?? '',
                        }}
                    />

                    <DialogFooter className="gap-2 sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            <X />
                            Cancelar
                        </Button>
                        <FormSubmitButton
                            type="submit"
                            loading={processing}
                            icon={<Save />}
                            label={isEdit ? 'Guardar cambios' : 'Guardar'}
                            labelLoading="Guardando…"
                            containerClassName="w-auto"
                        />
                    </DialogFooter>
                </>
            )}
        </InertiaFormDialog>
    );
}
