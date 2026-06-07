import { router } from '@inertiajs/react';
import {
    useCompanyCreateForm
    
} from '@/components/custom/company-switcher/use-company-create-form';
import type {CompanyCreateFormFields} from '@/components/custom/company-switcher/use-company-create-form';
import { FormDialogFooter } from '@/components/custom/form-dialog-footer';
import { FormSelect } from '@/components/custom/form-select';
import { FormTextInput } from '@/components/custom/form-text-input';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import { DOCUMENT_OPTIONS } from '@/pages/configuration/companies/tabs/tab-config';

type CompanyCreateDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function CompanyCreateDialog({
    open,
    onOpenChange,
}: CompanyCreateDialogProps) {
    const { formProps, headTitle, description } = useCompanyCreateForm();

    return (
        <InertiaFormDialog<CompanyCreateFormFields>
            open={open}
            onOpenChange={onOpenChange}
            title={headTitle}
            description={description}
            formKey="company-switcher-create"
            contentClassName="sm:max-w-2xl"
            inertiaForm={{ ...formProps }}
            formOptions={{
                onSuccess: () => {
                    router.flushAll();
                },
            }}
        >
            {({ processing, errors }) => (
                <>
                    <input
                        type="hidden"
                        name="select_after_create"
                        value="1"
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormSelect
                            label="Tipo de documento"
                            required
                            placeholder=""
                            options={[...DOCUMENT_OPTIONS]}
                            error={errors.document_type}
                            selectProps={{
                                id: 'company-create-document_type',
                                name: 'document_type',
                                defaultValue: 'RUT',
                            }}
                        />

                        <FormTextInput
                            label="Número de documento"
                            required
                            error={errors.document_number}
                            inputProps={{
                                id: 'company-create-document_number',
                                name: 'document_number',
                                maxLength: 255,
                            }}
                        />

                        <FormTextInput
                            label="Nombre"
                            required
                            error={errors.name}
                            inputProps={{
                                id: 'company-create-name',
                                name: 'name',
                                maxLength: 255,
                            }}
                        />

                        <FormTextInput
                            label="Alias"
                            error={errors.alias}
                            inputProps={{
                                id: 'company-create-alias',
                                name: 'alias',
                                maxLength: 255,
                            }}
                        />

                        <FormTextInput
                            label="Correo electrónico"
                            type="email"
                            error={errors.email}
                            inputProps={{
                                id: 'company-create-email',
                                name: 'email',
                                maxLength: 255,
                            }}
                        />

                        <FormTextInput
                            label="Teléfono"
                            error={errors.phone}
                            inputProps={{
                                id: 'company-create-phone',
                                name: 'phone',
                                maxLength: 255,
                            }}
                        />

                        <div className="sm:col-span-2">
                            <FormTextInput
                                label="Dirección"
                                error={errors.address}
                                inputProps={{
                                    id: 'company-create-address',
                                    name: 'address',
                                    maxLength: 255,
                                }}
                            />
                        </div>
                    </div>

                    <FormDialogFooter
                        onCancel={() => onOpenChange(false)}
                        processing={processing}
                        submitLabel="Crear empresa"
                        submitLabelLoading="Creando…"
                    />
                </>
            )}
        </InertiaFormDialog>
    );
}
