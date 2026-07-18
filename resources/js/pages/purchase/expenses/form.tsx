import { useMemo } from 'react';
import { FormDatePickerField } from '@/components/custom/form-date-picker-field';
import { FormDialogFooter } from '@/components/custom/form-dialog-footer';
import { FormSelect } from '@/components/custom/form-select';
import { FormTextInput } from '@/components/custom/form-text-input';
import { FormTextarea } from '@/components/custom/form-textarea';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import { useExpenseForm } from '@/pages/purchase/expenses/hooks/use-form';
import { formatExpenseTypeLabel } from '@/pages/purchase/expenses/types';
import type { Expense, ExpenseTypeOption } from '@/pages/purchase/expenses/types';

type ExpenseFormProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity: Expense | null;
    expenseTypes: ExpenseTypeOption[];
};

type ExpenseFormFields = Pick<
    Expense,
    'spent_at' | 'expense_type_id' | 'amount' | 'reason'
>;

export function ExpenseForm({
    open,
    onOpenChange,
    entity,
    expenseTypes,
}: ExpenseFormProps) {
    const { isEdit, formProps, headTitle, description } = useExpenseForm(entity);

    const typeOptions = useMemo(
        () =>
            expenseTypes.map((type) => ({
                id: type.id,
                label: formatExpenseTypeLabel(type),
            })),
        [expenseTypes],
    );

    const defaultSpentAt =
        entity?.spent_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10);

    return (
        <InertiaFormDialog<ExpenseFormFields>
            open={open}
            onOpenChange={onOpenChange}
            title={headTitle}
            description={description}
            formKey={entity?.id ?? 'create'}
            inertiaForm={{ ...formProps }}
        >
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormDatePickerField
                            label="Fecha"
                            name="spent_at"
                            required
                            defaultValue={defaultSpentAt}
                            error={errors.spent_at}
                            portalled={false}
                        />

                        <FormSelect
                            label="Tipo de gasto"
                            required
                            placeholder="Selecciona…"
                            options={typeOptions}
                            error={errors.expense_type_id}
                            selectProps={{
                                id: 'expense-expense_type_id',
                                name: 'expense_type_id',
                                defaultValue: entity?.expense_type_id ?? '',
                            }}
                        />
                    </div>

                    <FormTextInput
                        label="Monto (CLP)"
                        required
                        placeholder="0"
                        error={errors.amount}
                        inputProps={{
                            id: 'expense-amount',
                            name: 'amount',
                            type: 'number',
                            min: 0,
                            step: 1,
                            defaultValue: entity?.amount ?? '',
                        }}
                    />

                    <FormTextarea
                        label="Motivo"
                        required
                        placeholder="Describe el motivo del gasto"
                        error={errors.reason}
                        textareaProps={{
                            id: 'expense-reason',
                            name: 'reason',
                            maxLength: 500,
                            rows: 3,
                            defaultValue: entity?.reason ?? '',
                        }}
                    />

                    <FormDialogFooter
                        onCancel={() => onOpenChange(false)}
                        processing={processing}
                        isEdit={isEdit}
                    />
                </>
            )}
        </InertiaFormDialog>
    );
}
