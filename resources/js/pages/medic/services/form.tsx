import { Save, X } from 'lucide-react';
import { useMemo } from 'react';
import { FormSelect } from '@/components/custom/form-select';
import { FormSubmitButton } from '@/components/custom/form-submit-button';
import { FormTextInput } from '@/components/custom/form-text-input';
import { FormTextarea } from '@/components/custom/form-textarea';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { useServiceForm } from '@/pages/medic/services/hooks/use-form';
import { ServiceActiveSwitch } from '@/pages/medic/services/service-active-switch';
import { ServicePublicBookingSwitch } from '@/pages/medic/services/service-public-booking-switch';
import type { Service, SpecialtyOption } from '@/pages/medic/services/types';

type ServiceFormProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity: Service | null;
    specialties: SpecialtyOption[];
};

type ServiceFormFields = Pick<
    Service,
    | 'specialty_id'
    | 'name'
    | 'description'
    | 'price'
    | 'duration_minutes'
    | 'is_active'
    | 'is_public_booking'
>;

export function ServiceForm({
    open,
    onOpenChange,
    entity,
    specialties,
}: ServiceFormProps) {
    const { isEdit, formProps, headTitle, description } = useServiceForm(entity);

    const specialtyOptions = useMemo(
        () =>
            specialties
                .filter((s) => s.is_active || s.id === entity?.specialty_id)
                .map((s) => ({
                    id: s.id,
                    label: s.is_active ? s.name : `${s.name} (inactiva)`,
                })),
        [specialties, entity?.specialty_id],
    );

    return (
        <InertiaFormDialog<ServiceFormFields>
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
                        label="Especialidad"
                        required
                        placeholder="Selecciona…"
                        options={specialtyOptions}
                        error={errors.specialty_id}
                        selectProps={{
                            id: 'service-specialty_id',
                            name: 'specialty_id',
                            defaultValue: entity?.specialty_id ?? '',
                        }}
                    />

                    <FormTextInput
                        label="Nombre"
                        placeholder='Ej. "Consulta general", "Vacuna antirrábica"'
                        required
                        error={errors.name}
                        inputProps={{
                            id: 'service-name',
                            name: 'name',
                            maxLength: 255,
                            defaultValue: entity?.name ?? '',
                        }}
                    />

                    <FormTextarea
                        label="Descripción"
                        placeholder="Descripción para la web pública"
                        error={errors.description}
                        textareaProps={{
                            id: 'service-description',
                            name: 'description',
                            maxLength: 1000,
                            rows: 3,
                            defaultValue: entity?.description ?? '',
                        }}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormTextInput
                            label="Precio (CLP)"
                            placeholder="Vacío = consultar precio"
                            error={errors.price}
                            inputProps={{
                                id: 'service-price',
                                name: 'price',
                                type: 'number',
                                min: 0,
                                step: 1,
                                defaultValue: entity?.price ?? '',
                            }}
                        />

                        <FormTextInput
                            label="Duración (minutos)"
                            placeholder="Ej. 30"
                            error={errors.duration_minutes}
                            inputProps={{
                                id: 'service-duration_minutes',
                                name: 'duration_minutes',
                                type: 'number',
                                min: 1,
                                max: 1440,
                                defaultValue:
                                    entity?.duration_minutes != null
                                        ? String(entity.duration_minutes)
                                        : '',
                            }}
                        />
                    </div>

                    <ServiceActiveSwitch
                        defaultChecked={entity?.is_active ?? true}
                        error={errors.is_active}
                    />

                    <ServicePublicBookingSwitch
                        defaultChecked={entity?.is_public_booking ?? false}
                        error={errors.is_public_booking}
                    />

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
