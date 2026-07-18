import { FormDialogFooter } from '@/components/custom/form-dialog-footer';
import { FormTextInput } from '@/components/custom/form-text-input';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import { isGlobalRecord } from '@/lib/global-record';
import { useExpenseTypesForm } from '@/pages/purchase/expense-types/hooks/use-form';
import type { ExpenseType } from '@/pages/purchase/expense-types/types';

type ExpenseTypesFormProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity: ExpenseType | null;
};

type ExpenseTypesFormFields = Pick<ExpenseType, 'name' | 'abbreviation'>;

export function ExpenseTypesForm({
    open,
    onOpenChange,
    entity,
}: ExpenseTypesFormProps) {
    const { formProps, headTitle, description } = useExpenseTypesForm(entity);
    const isGlobal = entity !== null && isGlobalRecord(entity);

    return (
        <InertiaFormDialog<ExpenseTypesFormFields>
            open={open}
            onOpenChange={onOpenChange}
            title={headTitle}
            description={description}
            formKey={entity?.id ?? 'create'}
            inertiaForm={{ ...formProps }}
        >
            {({ processing, errors }) => (
                <>
                    {isGlobal ? (
                        <p className="text-muted-foreground text-sm">
                            Registro global del sistema. No se puede editar ni
                            eliminar.
                        </p>
                    ) : null}

                    <FormTextInput
                        label="Nombre"
                        placeholder='Ej. "Insumos clínicos", "Servicios"'
                        required
                        error={errors.name}
                        inputProps={{
                            id: 'expense-type-name',
                            name: 'name',
                            maxLength: 255,
                            defaultValue: entity?.name ?? '',
                            readOnly: isGlobal,
                        }}
                    />

                    <FormTextInput
                        label="Abreviatura"
                        placeholder='Ej. "INS", "SRV"'
                        required
                        error={errors.abbreviation}
                        inputProps={{
                            id: 'expense-type-abbreviation',
                            name: 'abbreviation',
                            maxLength: 32,
                            autoComplete: 'off',
                            defaultValue: entity?.abbreviation ?? '',
                            readOnly: isGlobal,
                        }}
                    />

                    <FormDialogFooter
                        onCancel={() => onOpenChange(false)}
                        processing={processing}
                        isEdit={entity !== null}
                        submitDisabled={isGlobal}
                    />
                </>
            )}
        </InertiaFormDialog>
    );
}
