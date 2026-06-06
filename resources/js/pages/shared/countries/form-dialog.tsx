import { FormDialogFooter } from '@/components/custom/form-dialog-footer';
import { FormTextInput } from '@/components/custom/form-text-input';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import { useCountryForm } from '@/pages/shared/countries/hooks/use-form';
import type { Country } from '@/pages/shared/countries/types';

type FormDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    country: Country | null;
};

export function FormDialog({ open, onOpenChange, country }: FormDialogProps) {
    const { isEdit, formProps, headTitle } = useCountryForm(country);

    const description = isEdit
        ? 'Actualiza los datos del país y su moneda.'
        : 'Registra un país con su código ISO, prefijo telefónico y moneda.';

    return (
        <InertiaFormDialog<
            Pick<
                Country,
                | 'name'
                | 'name_code'
                | 'phone_code'
                | 'currency_name'
                | 'currency_symbol'
            >
        >
            open={open}
            onOpenChange={onOpenChange}
            title={headTitle}
            description={description}
            formKey={country ? String(country.id) : 'create'}
            inertiaForm={{ ...formProps }}
        >
            {({ processing, errors }) => (
                <>
                    <FormTextInput
                        label="Nombre"
                        placeholder="Ej. Chile"
                        required
                        error={errors.name}
                        inputProps={{
                            id: 'country-name',
                            name: 'name',
                            maxLength: 255,
                            defaultValue: country?.name ?? '',
                        }}
                    />

                    <FormTextInput
                        label="Código (ISO)"
                        placeholder="Ej. CL"
                        required
                        error={errors.name_code}
                        inputProps={{
                            id: 'country-name_code',
                            name: 'name_code',
                            maxLength: 32,
                            autoComplete: 'off',
                            defaultValue: country?.name_code ?? '',
                        }}
                    />

                    <FormTextInput
                        label="Prefijo telefónico"
                        placeholder="Ej. +56"
                        required
                        error={errors.phone_code}
                        inputProps={{
                            id: 'country-phone_code',
                            name: 'phone_code',
                            maxLength: 32,
                            defaultValue: country?.phone_code ?? '',
                        }}
                    />

                    <FormTextInput
                        label="Nombre de la moneda"
                        placeholder="Ej. Peso Chileno"
                        required
                        error={errors.currency_name}
                        inputProps={{
                            id: 'country-currency_name',
                            name: 'currency_name',
                            maxLength: 255,
                            defaultValue: country?.currency_name ?? '',
                        }}
                    />

                    <FormTextInput
                        label="Símbolo / código de moneda"
                        placeholder="Ej. CLP"
                        required
                        error={errors.currency_symbol}
                        inputProps={{
                            id: 'country-currency_symbol',
                            name: 'currency_symbol',
                            maxLength: 32,
                            defaultValue: country?.currency_symbol ?? '',
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
