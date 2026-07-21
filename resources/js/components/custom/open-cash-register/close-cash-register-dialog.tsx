import { useMemo, useState } from 'react';
import CashRegistersController from '@/actions/App/Http/Controllers/Sale/CashRegistersController';
import {
    CurrencyDisplay,
    currencyDisplayClassName,
} from '@/components/custom/currency-display';
import { FormDialogFooter } from '@/components/custom/form-dialog-footer';
import { FormTextarea } from '@/components/custom/form-textarea';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import type { CloseCashRegisterDialogProps } from '@/components/custom/open-cash-register/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export type { CloseCashRegisterDialogProps } from '@/components/custom/open-cash-register/types';

type CloseCashRegisterFormFields = {
    notes: string;
};

export function CloseCashRegisterDialog({
    open,
    onOpenChange,
    cashRegister,
    lines,
}: CloseCashRegisterDialogProps) {
    const [declaredAmounts, setDeclaredAmounts] = useState<Record<string, string>>(
        () =>
            Object.fromEntries(
                lines.map((line) => [
                    line.payment_method_id,
                    String(line.system_amount),
                ]),
            ),
    );

    const hasDiscrepancy = useMemo(() => {
        return lines.some((line) => {
            const declared = Number(declaredAmounts[line.payment_method_id] ?? 0);

            return Number.isFinite(declared) && declared !== line.system_amount;
        });
    }, [declaredAmounts, lines]);

    return (
        <InertiaFormDialog<CloseCashRegisterFormFields>
            open={open}
            onOpenChange={onOpenChange}
            title="Cierre de caja"
            description={
                cashRegister.is_from_previous_day
                    ? 'Esta caja quedó abierta de un día anterior. Debes cerrarla antes de abrir una nueva: cada caja es de un solo día.'
                    : 'Confirma los montos de las ventas y agrega observaciones si tienes descuadre de caja.'
            }
            formKey={`close-cash-register-${cashRegister.id}`}
            contentClassName="sm:max-w-xl"
            inertiaForm={{
                ...CashRegistersController.close.form(cashRegister.id),
            }}
        >
            {({ processing, errors }) => (
                <>
                    <p className="text-muted-foreground text-sm">
                        Monto de apertura:{' '}
                        <CurrencyDisplay value={cashRegister.opening_amount} />
                    </p>

                    <div className="space-y-3">
                        {lines.map((line, index) => {
                            const declaredError =
                                errors[`lines.${index}.declared_amount`] ??
                                errors[`lines.${index}.payment_method_id`];

                            return (
                                <div
                                    key={line.payment_method_id}
                                    className="grid grid-cols-[minmax(0,1fr)_7rem_7rem] items-center gap-2"
                                >
                                    <Label
                                        htmlFor={`close-cash-declared-${line.payment_method_id}`}
                                        className="truncate font-normal"
                                    >
                                        {line.payment_method_name}
                                    </Label>
                                    <input
                                        type="hidden"
                                        name={`lines[${index}][payment_method_id]`}
                                        value={line.payment_method_id}
                                    />
                                    <Input
                                        readOnly
                                        tabIndex={-1}
                                        value={line.system_amount}
                                        className={cn(
                                            currencyDisplayClassName,
                                            'bg-muted text-muted-foreground',
                                        )}
                                        aria-label={`${line.payment_method_name} sistema`}
                                    />
                                    <Input
                                        id={`close-cash-declared-${line.payment_method_id}`}
                                        name={`lines[${index}][declared_amount]`}
                                        type="number"
                                        min={0}
                                        step={1}
                                        inputMode="numeric"
                                        required
                                        className={currencyDisplayClassName}
                                        value={
                                            declaredAmounts[
                                                line.payment_method_id
                                            ] ?? '0'
                                        }
                                        onChange={(event) => {
                                            const value = event.target.value;
                                            setDeclaredAmounts((prev) => ({
                                                ...prev,
                                                [line.payment_method_id]: value,
                                            }));
                                        }}
                                        aria-invalid={
                                            declaredError ? true : undefined
                                        }
                                        aria-label={`${line.payment_method_name} declarado`}
                                    />
                                </div>
                            );
                        })}
                        {errors.lines ? (
                            <p className="text-destructive text-sm">
                                {errors.lines}
                            </p>
                        ) : null}
                    </div>

                    <FormTextarea
                        label="Observaciones"
                        required={hasDiscrepancy}
                        placeholder="Observaciones"
                        error={errors.notes}
                        textareaProps={{
                            id: 'close-cash-register-notes',
                            name: 'notes',
                            rows: 3,
                            maxLength: 2000,
                            required: hasDiscrepancy,
                        }}
                    />

                    <FormDialogFooter
                        onCancel={() => onOpenChange(false)}
                        processing={processing}
                        submitLabel="Cerrar caja"
                        submitLabelLoading="Cerrando…"
                    />
                </>
            )}
        </InertiaFormDialog>
    );
}
