import CashRegistersController from '@/actions/App/Http/Controllers/Sale/CashRegistersController';
import { FormDialogFooter } from '@/components/custom/form-dialog-footer';
import { FormSelect } from '@/components/custom/form-select';
import { FormTextInput } from '@/components/custom/form-text-input';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import type { OpenCashRegisterDialogProps } from '@/components/custom/open-cash-register/types';

export type { OpenCashRegisterDialogProps } from '@/components/custom/open-cash-register/types';

type OpenCashRegisterFormFields = {
    office_id: string;
    opening_amount: string;
};

export function OpenCashRegisterDialog({
    open,
    onOpenChange,
    offices,
}: OpenCashRegisterDialogProps) {
    const defaultOfficeId =
        offices.find((office) => office.is_main)?.id ?? offices[0]?.id ?? '';
    const showOfficeSelect = offices.length > 1;

    return (
        <InertiaFormDialog<OpenCashRegisterFormFields>
            open={open}
            onOpenChange={onOpenChange}
            title="Abrir caja"
            description="Registra el monto inicial de apertura de caja en efectivo (opcional)."
            formKey="open-cash-register"
            inertiaForm={{
                ...CashRegistersController.store.form(),
            }}
        >
            {({ processing, errors }) => (
                <>
                    {showOfficeSelect ? (
                        <FormSelect
                            label="Sucursal"
                            required
                            placeholder="Selecciona una sucursal…"
                            options={offices.map((office) => ({
                                value: office.id,
                                label: office.is_main
                                    ? `${office.name} (matriz)`
                                    : office.name,
                            }))}
                            error={errors.office_id}
                            selectProps={{
                                id: 'open-cash-register-office_id',
                                name: 'office_id',
                                required: true,
                                defaultValue: defaultOfficeId,
                            }}
                        />
                    ) : (
                        <input
                            type="hidden"
                            name="office_id"
                            value={defaultOfficeId}
                        />
                    )}

                    <FormTextInput
                        label="Monto inicial (CLP)"
                        placeholder="0"
                        error={errors.opening_amount}
                        inputClassName="font-currency tabular-nums"
                        inputProps={{
                            id: 'open-cash-register-opening_amount',
                            name: 'opening_amount',
                            type: 'number',
                            min: 0,
                            step: 1,
                            inputMode: 'numeric',
                            defaultValue: '',
                            autoFocus: true,
                        }}
                    />

                    {errors.office_id && !showOfficeSelect ? (
                        <p className="text-destructive text-sm">
                            {errors.office_id}
                        </p>
                    ) : null}

                    <FormDialogFooter
                        onCancel={() => onOpenChange(false)}
                        processing={processing}
                        submitLabel="Abrir caja"
                        submitLabelLoading="Abriendo…"
                    />
                </>
            )}
        </InertiaFormDialog>
    );
}
