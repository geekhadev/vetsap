import { FormAppointmentStatusColorPicker } from '@/components/custom/form-appointment-status-color-picker';
import { FormDialogFooter } from '@/components/custom/form-dialog-footer';
import { FormTextInput } from '@/components/custom/form-text-input';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import { isAppointmentStatusColorValue } from '@/lib/appointment-status-colors';
import { usePurchaseOrderStatusesForm } from '@/pages/purchase/purchase-order-statuses/hooks/use-form';
import type { PurchaseOrderStatus } from '@/pages/purchase/purchase-order-statuses/types';

type PurchaseOrderStatusesFormProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity: PurchaseOrderStatus | null;
};

type PurchaseOrderStatusesFormFields = Pick<PurchaseOrderStatus, 'name' | 'color'>;

export function PurchaseOrderStatusesForm({
    open,
    onOpenChange,
    entity,
}: PurchaseOrderStatusesFormProps) {
    const { formProps, headTitle, description } =
        usePurchaseOrderStatusesForm(entity);

    const defaultColor =
        entity?.color && isAppointmentStatusColorValue(entity.color)
            ? entity.color
            : 'blue';

    return (
        <InertiaFormDialog<PurchaseOrderStatusesFormFields>
            open={open}
            onOpenChange={onOpenChange}
            title={headTitle}
            description={description}
            formKey={entity?.id ?? 'create'}
            inertiaForm={{ ...formProps }}
        >
            {({ processing, errors }) => (
                <>
                    <FormTextInput
                        label="Nombre"
                        placeholder='Ej. "Enviada", "Recibida"'
                        required
                        error={errors.name}
                        inputProps={{
                            id: 'purchase-order-status-name',
                            name: 'name',
                            maxLength: 255,
                            defaultValue: entity?.name ?? '',
                        }}
                    />

                    <FormAppointmentStatusColorPicker
                        key={`${entity?.id ?? 'create'}-color`}
                        name="color"
                        defaultValue={defaultColor}
                        required
                        error={errors.color}
                    />

                    <FormDialogFooter
                        onCancel={() => onOpenChange(false)}
                        processing={processing}
                        isEdit={entity !== null}
                    />
                </>
            )}
        </InertiaFormDialog>
    );
}
