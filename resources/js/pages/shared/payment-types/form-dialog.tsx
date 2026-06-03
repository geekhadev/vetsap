import { Save, X } from 'lucide-react';
import { FormSubmitButton } from '@/components/custom/form-submit-button';
import { FormTextInput } from '@/components/custom/form-text-input';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { usePaymentTypeForm } from '@/pages/shared/payment-types/hooks/use-form';
import type { PaymentType } from '@/pages/shared/payment-types/types';

type FormDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    paymentType: PaymentType | null;
};

export function FormDialog({
    open,
    onOpenChange,
    paymentType,
}: FormDialogProps) {
    const { isEdit, formProps, headTitle } = usePaymentTypeForm(paymentType);

    const description = isEdit
        ? 'Actualiza el nombre y el código del tipo de pago.'
        : 'Define el nombre y un código único (p. ej. CO, CR).';

    return (
        <InertiaFormDialog<Pick<PaymentType, 'name' | 'code'>>
            open={open}
            onOpenChange={onOpenChange}
            title={headTitle}
            description={description}
            formKey={paymentType?.id ?? 'create'}
            inertiaForm={{ ...formProps }}
        >
            {({ processing, errors }) => (
                <>
                    <FormTextInput
                        label="Nombre"
                        placeholder="Ej. Contado"
                        required
                        error={errors.name}
                        inputProps={{
                            id: 'payment-type-name',
                            name: 'name',
                            maxLength: 255,
                            defaultValue: paymentType?.name ?? '',
                        }}
                    />

                    <FormTextInput
                        label="Código"
                        placeholder="Ej. CO"
                        required
                        error={errors.code}
                        inputProps={{
                            id: 'payment-type-code',
                            name: 'code',
                            maxLength: 255,
                            autoComplete: 'off',
                            defaultValue: paymentType?.code ?? '',
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
