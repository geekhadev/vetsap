import { FormDialogFooter } from '@/components/custom/form-dialog-footer';
import { FormTextInput } from '@/components/custom/form-text-input';
import { FormTextarea } from '@/components/custom/form-textarea';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useSiiEconomicActivityForm } from '@/pages/shared/sii-economic-activities/hooks/use-form';
import type { SiiEconomicActivity } from '@/pages/shared/sii-economic-activities/types';

type FormDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    siiEconomicActivity: SiiEconomicActivity | null;
};

export function FormDialog({
    open,
    onOpenChange,
    siiEconomicActivity,
}: FormDialogProps) {
    const { isEdit, formProps, headTitle } =
        useSiiEconomicActivityForm(siiEconomicActivity);

    const description = isEdit
        ? 'Actualiza el código SII, el rubro y los indicadores tributarios.'
        : 'Registra un código de actividad económica del SII con su descripción y uso de IVA / internet.';

    return (
        <InertiaFormDialog<
            Pick<
                SiiEconomicActivity,
                | 'code'
                | 'description'
                | 'tax_category'
                | 'use_iva'
                | 'use_internet'
            >
        >
            open={open}
            onOpenChange={onOpenChange}
            title={headTitle}
            description={description}
            formKey={
                siiEconomicActivity
                    ? String(siiEconomicActivity.id)
                    : 'create'
            }
            inertiaForm={{ ...formProps }}
        >
            {({ processing, errors }) => (
                <>
                    <FormTextInput
                        label="Código (6 dígitos)"
                        placeholder="Ej. 011101"
                        required
                        error={errors.code}
                        inputProps={{
                            id: 'sii-economic-activity-code',
                            name: 'code',
                            maxLength: 6,
                            minLength: 6,
                            pattern: '[0-9]{6}',
                            inputMode: 'numeric',
                            autoComplete: 'off',
                            defaultValue: siiEconomicActivity?.code ?? '',
                        }}
                    />

                    <FormTextarea
                        label="Descripción"
                        placeholder="Ej. CULTIVO DE TRIGO"
                        required
                        error={errors.description}
                        textareaProps={{
                            id: 'sii-economic-activity-description',
                            name: 'description',
                            rows: 4,
                            maxLength: 65535,
                            defaultValue: siiEconomicActivity?.description ?? '',
                        }}
                    />

                    <FormTextInput
                        label="Categoría tributaria"
                        placeholder="Ej. 1 o G"
                        required
                        error={errors.tax_category}
                        inputProps={{
                            id: 'sii-economic-activity-tax_category',
                            name: 'tax_category',
                            maxLength: 32,
                            autoComplete: 'off',
                            defaultValue: siiEconomicActivity?.tax_category ?? '',
                        }}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="sii-economic-activity-use_iva">
                                Afecto a IVA
                            </Label>
                            <input type="hidden" name="use_iva" value="0" />
                            <input
                                id="sii-economic-activity-use_iva"
                                name="use_iva"
                                value="1"
                                type="checkbox"
                                defaultChecked={
                                    siiEconomicActivity?.use_iva ?? false
                                }
                                className={cn(
                                    'size-4 rounded-[4px] border border-input shadow-xs',
                                    'accent-primary',
                                )}
                            />
                            {errors.use_iva ? (
                                <p className="text-sm text-destructive">
                                    {errors.use_iva}
                                </p>
                            ) : null}
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="sii-economic-activity-use_internet">
                                Disponible en internet
                            </Label>
                            <input type="hidden" name="use_internet" value="0" />
                            <input
                                id="sii-economic-activity-use_internet"
                                name="use_internet"
                                value="1"
                                type="checkbox"
                                defaultChecked={
                                    siiEconomicActivity?.use_internet ?? false
                                }
                                className={cn(
                                    'size-4 rounded-[4px] border border-input shadow-xs',
                                    'accent-primary',
                                )}
                            />
                            {errors.use_internet ? (
                                <p className="text-sm text-destructive">
                                    {errors.use_internet}
                                </p>
                            ) : null}
                        </div>
                    </div>

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
