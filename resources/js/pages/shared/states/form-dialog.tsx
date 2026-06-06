import { FormDialogFooter } from '@/components/custom/form-dialog-footer';
import { FormSelect } from '@/components/custom/form-select';
import { FormTextInput } from '@/components/custom/form-text-input';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import { useStateForm } from '@/pages/shared/states/hooks/use-form';
import type { CountryOption, State } from '@/pages/shared/states/types';

type FormDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity: State | null;
    countries: CountryOption[];
};

export function FormDialog({
    open,
    onOpenChange,
    entity,
    countries,
}: FormDialogProps) {
    const { isEdit, formProps, headTitle, description } = useStateForm(entity);

    const countryOptions = countries.map((country) => ({
        id: country.id,
        label: country.name,
    }));

    return (
        <InertiaFormDialog<Pick<State, 'country_id' | 'name'>>
            open={open}
            onOpenChange={onOpenChange}
            title={headTitle}
            description={description}
            formKey={entity?.id ?? 'create'}
            inertiaForm={{ ...formProps }}
        >
            {({ processing, errors }) => (
                <>
                    <FormSelect
                        label="Pais"
                        placeholder="Selecciona un pais"
                        required
                        options={countryOptions}
                        error={errors.country_id}
                        selectProps={{
                            id: 'state-country_id',
                            name: 'country_id',
                            defaultValue: entity ? String(entity.country_id) : '',
                        }}
                    />

                    <FormTextInput
                        label="Nombre"
                        placeholder="Ej. Valparaiso"
                        required
                        error={errors.name}
                        inputProps={{
                            id: 'state-name',
                            name: 'name',
                            maxLength: 255,
                            defaultValue: entity?.name ?? '',
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
