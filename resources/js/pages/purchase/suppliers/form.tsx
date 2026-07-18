import { FormDialogFooter } from '@/components/custom/form-dialog-footer';
import { FormSelect } from '@/components/custom/form-select';
import { FormTextInput } from '@/components/custom/form-text-input';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import { useSupplierForm } from '@/pages/purchase/suppliers/hooks/use-form';
import { DOCUMENT_TYPE_OPTIONS } from '@/pages/purchase/suppliers/types';
import type { Supplier } from '@/pages/purchase/suppliers/types';

type SupplierFormProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity: Supplier | null;
};

type SupplierFormFields = Pick<
    Supplier,
    'name' | 'document_type' | 'document_number' | 'email' | 'phone' | 'address'
>;

export function SupplierForm({ open, onOpenChange, entity }: SupplierFormProps) {
    const { isEdit, formProps, headTitle, description } = useSupplierForm(entity);

    const documentOptions = DOCUMENT_TYPE_OPTIONS.map((opt) => ({
        id: opt.id,
        label: opt.label,
    }));

    return (
        <InertiaFormDialog<SupplierFormFields>
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
                        <FormSelect
                            label="Tipo de documento"
                            required={!isEdit}
                            placeholder="Selecciona…"
                            options={documentOptions}
                            error={errors.document_type}
                            selectProps={{
                                id: 'supplier-document_type',
                                name: 'document_type',
                                defaultValue: entity?.document_type ?? '',
                                disabled: isEdit,
                            }}
                        />

                        <FormTextInput
                            label="Número de documento"
                            required={!isEdit}
                            placeholder="Ej. 12.345.678-9"
                            error={errors.document_number}
                            inputProps={{
                                id: 'supplier-document_number',
                                name: 'document_number',
                                maxLength: 20,
                                defaultValue: entity?.document_number ?? '',
                                disabled: isEdit,
                            }}
                        />
                    </div>

                    <FormTextInput
                        label="Nombre"
                        placeholder="Razón social o nombre completo"
                        required
                        error={errors.name}
                        inputProps={{
                            id: 'supplier-name',
                            name: 'name',
                            maxLength: 255,
                            defaultValue: entity?.name ?? '',
                        }}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormTextInput
                            label="Teléfono"
                            placeholder="+56912345678"
                            error={errors.phone}
                            inputProps={{
                                id: 'supplier-phone',
                                name: 'phone',
                                maxLength: 20,
                                defaultValue: entity?.phone ?? '',
                            }}
                        />

                        <FormTextInput
                            label="Email"
                            placeholder="correo@ejemplo.cl"
                            error={errors.email}
                            inputProps={{
                                id: 'supplier-email',
                                name: 'email',
                                type: 'email',
                                maxLength: 255,
                                defaultValue: entity?.email ?? '',
                            }}
                        />
                    </div>

                    <FormTextInput
                        label="Dirección"
                        placeholder="Dirección fiscal"
                        error={errors.address}
                        inputProps={{
                            id: 'supplier-address',
                            name: 'address',
                            maxLength: 500,
                            defaultValue: entity?.address ?? '',
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
