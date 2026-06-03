import { Save, X } from 'lucide-react';
import { FormBooleanSwitch } from '@/components/custom/form-boolean-switch';
import { FormSubmitButton } from '@/components/custom/form-submit-button';
import { FormTextInput } from '@/components/custom/form-text-input';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { useSiiTaxDocumentTypeForm } from '@/pages/shared/sii-tax-document-types/hooks/use-form';
import type { SiiTaxDocumentType } from '@/pages/shared/sii-tax-document-types/types';

type FormDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    siiTaxDocumentType: SiiTaxDocumentType | null;
};

export function FormDialog({
    open,
    onOpenChange,
    siiTaxDocumentType,
}: FormDialogProps) {
    const { isEdit, formProps, headTitle } =
        useSiiTaxDocumentTypeForm(siiTaxDocumentType);

    const description = isEdit
        ? 'Actualiza el código, nombre, abreviatura y el uso en ventas o compras.'
        : 'Registra un código de documento tributario del SII y define si aplica en ventas, compras o ambos.';

    return (
        <InertiaFormDialog<
            Pick<
                SiiTaxDocumentType,
                'code' | 'name' | 'abbreviation' | 'use_sale' | 'use_purchase'
            >
        >
            open={open}
            onOpenChange={onOpenChange}
            title={headTitle}
            description={description}
            formKey={siiTaxDocumentType?.id ?? 'create'}
            inertiaForm={{ ...formProps }}
        >
            {({ processing, errors }) => (
                <>
                    <FormTextInput
                        label="Código"
                        placeholder="Ej. 33"
                        required
                        error={errors.code}
                        inputProps={{
                            id: 'sii-tax-document-type-code',
                            name: 'code',
                            maxLength: 16,
                            autoComplete: 'off',
                            defaultValue: siiTaxDocumentType?.code ?? '',
                        }}
                    />

                    <FormTextInput
                        label="Nombre"
                        placeholder="Nombre del documento"
                        required
                        error={errors.name}
                        inputProps={{
                            id: 'sii-tax-document-type-name',
                            name: 'name',
                            maxLength: 512,
                            defaultValue: siiTaxDocumentType?.name ?? '',
                        }}
                    />

                    <FormTextInput
                        label="Abreviatura"
                        placeholder="Ej. FAE"
                        required
                        error={errors.abbreviation}
                        inputProps={{
                            id: 'sii-tax-document-type-abbreviation',
                            name: 'abbreviation',
                            maxLength: 32,
                            autoComplete: 'off',
                            defaultValue:
                                siiTaxDocumentType?.abbreviation ?? '',
                        }}
                    />

                    <div className="grid gap-6 sm:grid-cols-2">
                        <FormBooleanSwitch
                            label="Aplica en ventas"
                            name="use_sale"
                            id="sii-tax-document-type-use_sale"
                            defaultChecked={
                                siiTaxDocumentType?.use_sale ?? false
                            }
                            error={errors.use_sale}
                        />
                        <FormBooleanSwitch
                            label="Aplica en compras"
                            name="use_purchase"
                            id="sii-tax-document-type-use_purchase"
                            defaultChecked={
                                siiTaxDocumentType?.use_purchase ?? false
                            }
                            error={errors.use_purchase}
                        />
                    </div>

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
