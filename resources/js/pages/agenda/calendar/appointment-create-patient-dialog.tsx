import { CheckCircle2, CirclePlus, LoaderCircle, UserPlus } from 'lucide-react';
import type { FormEvent } from 'react';
import { FormDialogFooter } from '@/components/custom/form-dialog-footer';
import { FormSelect } from '@/components/custom/form-select';
import { FormTextInput } from '@/components/custom/form-text-input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useAppointmentCreatePatientDialog } from '@/pages/agenda/calendar/hooks/use-appointment-create-patient-dialog';
import type {
    AppointmentFormPatientOption,
    AppointmentFormSpeciesOption,
} from '@/pages/agenda/calendar/types';
import { SEX_OPTIONS } from '@/pages/medic/patients/types';
import { DOCUMENT_TYPE_OPTIONS } from '@/pages/sale/customers/types';

type AppointmentCreatePatientDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    speciesOptions: AppointmentFormSpeciesOption[];
    onCreated: (patient: AppointmentFormPatientOption) => void;
};

function fieldError(
    errors: Record<string, string | string[] | undefined>,
    key: string,
): string | undefined {
    const value = errors[key];

    if (Array.isArray(value)) {
        return value[0];
    }

    return value;
}

function AppointmentCreatePatientDialogInner({
    speciesOptions,
    onCreated,
    onClose,
}: {
    speciesOptions: AppointmentFormSpeciesOption[];
    onCreated: (patient: AppointmentFormPatientOption) => void;
    onClose: () => void;
}) {
    const {
        form,
        lookupStatus,
        matchedCustomer,
        canSubmit,
        processing,
        errors,
        updateField,
        submit,
    } = useAppointmentCreatePatientDialog({
        onCreated,
    });

    const sexOptions = SEX_OPTIONS.map((option) => ({
        id: option.id,
        label: option.label,
    }));

    const documentOptions = DOCUMENT_TYPE_OPTIONS.map((option) => ({
        id: option.id,
        label: option.label,
    }));

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        void submit();
    }

    return (
        <>
            <DialogHeader>
                <DialogTitle>Nuevo paciente</DialogTitle>
                <DialogDescription>
                    Busca el cliente por documento. Si existe, solo creas el
                    paciente; si no, se crea el cliente junto con el paciente.
                </DialogDescription>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <p className="text-sm font-medium">Cliente</p>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormSelect
                            label="Tipo de documento"
                            required
                            placeholder="Selecciona…"
                            options={documentOptions}
                            error={fieldError(errors, 'document_type')}
                            selectProps={{
                                id: 'appointment-create-patient-document_type',
                                value: form.documentType,
                                onChange: (event) =>
                                    updateField(
                                        'documentType',
                                        event.target.value === 'pasaporte'
                                            ? 'pasaporte'
                                            : 'rut',
                                    ),
                            }}
                        />

                        <FormTextInput
                            label="Número de documento"
                            required
                            placeholder="Ej. 12.345.678-9"
                            error={fieldError(errors, 'document_number')}
                            inputProps={{
                                id: 'appointment-create-patient-document_number',
                                maxLength: 20,
                                value: form.documentNumber,
                                onChange: (event) =>
                                    updateField(
                                        'documentNumber',
                                        event.target.value,
                                    ),
                                autoComplete: 'off',
                            }}
                        />
                    </div>

                    {lookupStatus === 'idle' ? (
                        <p className="text-muted-foreground text-sm">
                            Escribe al menos 3 caracteres del documento para
                            buscar el cliente.
                        </p>
                    ) : null}

                    {lookupStatus === 'looking' ? (
                        <p className="text-muted-foreground flex items-center gap-2 text-sm">
                            <LoaderCircle className="size-4 animate-spin" />
                            Buscando cliente…
                        </p>
                    ) : null}

                    {lookupStatus === 'found' && matchedCustomer ? (
                        <div
                            role="status"
                            className={cn(
                                'flex w-full items-start gap-2 rounded-md border border-emerald-200/90 bg-emerald-50 px-3 py-2 text-sm text-emerald-800',
                                'dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200',
                            )}
                        >
                            <CheckCircle2
                                className="mt-0.5 size-4 shrink-0"
                                aria-hidden
                            />
                            <span>
                                Cliente encontrado:{' '}
                                <span className="font-medium">
                                    {matchedCustomer.name}
                                </span>
                                . Solo completa los datos del paciente.
                            </span>
                        </div>
                    ) : null}

                    {lookupStatus === 'not_found' ? (
                        <div className="space-y-4">
                            <div
                                role="status"
                                className={cn(
                                    'flex w-full items-start gap-2 rounded-md border border-amber-200/90 bg-amber-50 px-3 py-2 text-sm text-amber-900',
                                    'dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-100',
                                )}
                            >
                                <UserPlus
                                    className="mt-0.5 size-4 shrink-0"
                                    aria-hidden
                                />
                                <span>
                                    No hay un cliente con este documento.
                                    Completa los datos para crearlo junto con el
                                    paciente.
                                </span>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormTextInput
                                    label="Nombre del cliente"
                                    required
                                    placeholder="Nombre completo"
                                    error={fieldError(errors, 'customer_name')}
                                    inputProps={{
                                        id: 'appointment-create-patient-customer_name',
                                        maxLength: 255,
                                        value: form.customerName,
                                        onChange: (event) =>
                                            updateField(
                                                'customerName',
                                                event.target.value,
                                            ),
                                    }}
                                />

                                <FormTextInput
                                    label="Teléfono"
                                    placeholder="+56912345678"
                                    error={fieldError(errors, 'phone')}
                                    inputProps={{
                                        id: 'appointment-create-patient-phone',
                                        maxLength: 20,
                                        value: form.phone,
                                        onChange: (event) =>
                                            updateField(
                                                'phone',
                                                event.target.value,
                                            ),
                                    }}
                                />
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="space-y-4 border-t pt-4">
                    <p className="text-sm font-medium">Paciente</p>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormTextInput
                            label="Nombre"
                            required
                            placeholder='Ej. "Luna"'
                            error={fieldError(errors, 'name')}
                            inputProps={{
                                id: 'appointment-create-patient-name',
                                maxLength: 255,
                                value: form.patientName,
                                onChange: (event) =>
                                    updateField(
                                        'patientName',
                                        event.target.value,
                                    ),
                            }}
                        />

                        <FormTextInput
                            label="Ficha"
                            placeholder="Se genera automáticamente si queda vacío"
                            error={fieldError(errors, 'record_number')}
                            inputProps={{
                                id: 'appointment-create-patient-record_number',
                                maxLength: 50,
                                value: form.recordNumber,
                                onChange: (event) =>
                                    updateField(
                                        'recordNumber',
                                        event.target.value,
                                    ),
                            }}
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormSelect
                            label="Especie"
                            required
                            placeholder="Selecciona…"
                            options={speciesOptions}
                            error={fieldError(errors, 'species_id')}
                            selectProps={{
                                id: 'appointment-create-patient-species_id',
                                value: form.speciesId,
                                onChange: (event) =>
                                    updateField(
                                        'speciesId',
                                        event.target.value,
                                    ),
                            }}
                        />

                        <FormSelect
                            label="Sexo"
                            required
                            placeholder="Selecciona…"
                            options={sexOptions}
                            error={fieldError(errors, 'sex')}
                            selectProps={{
                                id: 'appointment-create-patient-sex',
                                value: form.sex,
                                onChange: (event) => {
                                    const value = event.target.value;

                                    updateField(
                                        'sex',
                                        value === 'male' ||
                                            value === 'female' ||
                                            value === 'unknown'
                                            ? value
                                            : '',
                                    );
                                },
                            }}
                        />
                    </div>
                </div>

                <FormDialogFooter
                    onCancel={onClose}
                    processing={processing}
                    submitLabel="Crear y seleccionar"
                    submitLabelLoading="Creando…"
                    submitIcon={<CirclePlus />}
                    submitDisabled={!canSubmit || processing}
                />
            </form>
        </>
    );
}

export function AppointmentCreatePatientDialog({
    open,
    onOpenChange,
    speciesOptions,
    onCreated,
}: AppointmentCreatePatientDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                {open ? (
                    <AppointmentCreatePatientDialogInner
                        key="appointment-create-patient"
                        speciesOptions={speciesOptions}
                        onCreated={onCreated}
                        onClose={() => onOpenChange(false)}
                    />
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
