import { useMemo, useState } from 'react';
import { CurrencyDisplay } from '@/components/custom/currency-display';
import { FormCombobox } from '@/components/custom/form-combobox';
import { FormDialogFooter } from '@/components/custom/form-dialog-footer';
import { FormTextarea } from '@/components/custom/form-textarea';
import type { CalendarHoliday } from '@/components/custom/full-calendar/types';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import { InfoBadge } from '@/components/custom/info-badge';
import { AppointmentScheduleField } from '@/pages/agenda/calendar/appointment-schedule-field';
import { useAppointmentForm } from '@/pages/agenda/calendar/hooks/use-appointment-form';
import {
    buildInitialAppointmentFormState,
    resolveDoctorScheduleWindows,
    resolveDoctorsForService,
    resolveSingleDoctorId,
} from '@/pages/agenda/calendar/types';
import type {
    AppointmentFormDefaults,
    AppointmentFormFields,
    AppointmentFormOptions,
} from '@/pages/agenda/calendar/types';

type AppointmentFormProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    formOptions: AppointmentFormOptions;
    defaults: AppointmentFormDefaults;
    holidays: CalendarHoliday[];
};

export function AppointmentForm({
    open,
    onOpenChange,
    formOptions,
    defaults,
    holidays,
}: AppointmentFormProps) {
    const { formProps, headTitle, description } = useAppointmentForm();

    const [formState, setFormState] = useState(() =>
        buildInitialAppointmentFormState(formOptions, defaults),
    );

    const patientSubjectOptions = useMemo(
        () =>
            formOptions.patients.map((option) => ({
                value: option.id,
                label: option.label,
                searchText: option.search_text,
            })),
        [formOptions.patients],
    );

    const serviceOptions = useMemo(
        () =>
            formOptions.services.map((option) => ({
                value: option.id,
                label: option.label,
                searchText: option.label,
            })),
        [formOptions.services],
    );

    const doctorOptions = useMemo(
        () =>
            resolveDoctorsForService(
                formOptions.doctors,
                formState.serviceId,
            ).map((option) => ({
                value: option.id,
                label: option.label,
            })),
        [formOptions.doctors, formState.serviceId],
    );

    const officeOptions = useMemo(
        () =>
            formOptions.offices.map((option) => ({
                value: option.id,
                label: option.label,
            })),
        [formOptions.offices],
    );

    const selectedService = useMemo(
        () =>
            formOptions.services.find(
                (service) => service.id === formState.serviceId,
            ),
        [formOptions.services, formState.serviceId],
    );

    const resolvedPatientId =
        formState.patientId !== '' &&
        patientSubjectOptions.some(
            (option) => option.value === formState.patientId,
        )
            ? formState.patientId
            : '';

    const resolvedDoctorId =
        formState.doctorId !== '' &&
        doctorOptions.some((option) => option.value === formState.doctorId)
            ? formState.doctorId
            : '';

    const resolvedOfficeId =
        formOptions.offices.length === 1
            ? (formOptions.offices[0]?.id ?? '')
            : formState.officeId;

    const doctorScheduleWindows = useMemo(
        () =>
            resolveDoctorScheduleWindows(
                formOptions.doctors,
                resolvedDoctorId,
            ),
        [formOptions.doctors, resolvedDoctorId],
    );

    const scheduleValidationEnabled =
        resolvedDoctorId !== '' &&
        selectedService?.duration_minutes !== null &&
        selectedService?.duration_minutes !== undefined;

    return (
        <InertiaFormDialog<AppointmentFormFields>
            open={open}
            onOpenChange={onOpenChange}
            title={headTitle}
            description={description}
            formKey={`create-${defaults.appointmentDate}-${defaults.startsAtTime}`}
            inertiaForm={{ ...formProps }}
            contentClassName="sm:max-w-lg"
            formClassName="space-y-4"
        >
            {({ processing, errors }) => (
                <>
                    <input
                        type="hidden"
                        name="customer_id"
                        value={formState.customerId}
                    />
                    <input
                        type="hidden"
                        name="patient_id"
                        value={resolvedPatientId}
                    />
                    <input
                        type="hidden"
                        name="doctor_id"
                        value={resolvedDoctorId}
                    />
                    <input type="hidden" name="service_id" value={formState.serviceId} />
                    <input type="hidden" name="office_id" value={resolvedOfficeId} />
                    <input
                        type="hidden"
                        name="appointment_date"
                        value={formState.appointmentDate}
                    />
                    <input
                        type="hidden"
                        name="starts_at_time"
                        value={formState.startsAtTime}
                    />

                    <FormCombobox
                        label="Cliente / paciente"
                        required
                        placeholder="Buscar por teléfono, documento, cliente o paciente…"
                        searchPlaceholder="Teléfono, documento, nombre o ficha…"
                        emptyMessage="No hay pacientes activos registrados."
                        options={patientSubjectOptions}
                        value={resolvedPatientId}
                        onValueChange={(patientId) => {
                            const subject = formOptions.patients.find(
                                (patient) => patient.id === patientId,
                            );

                            setFormState((current) => ({
                                ...current,
                                patientId,
                                customerId: subject?.customer_id ?? '',
                            }));
                        }}
                        error={errors.patient_id ?? errors.customer_id}
                        id="appointment-patient-subject"
                    />

                    <FormCombobox
                        label="Servicio"
                        required
                        placeholder="Buscar servicio…"
                        searchPlaceholder="Buscar servicio…"
                        emptyMessage="No hay servicios activos."
                        options={serviceOptions}
                        value={formState.serviceId}
                        onValueChange={(serviceId) => {
                            setFormState((current) => ({
                                ...current,
                                serviceId,
                                doctorId: resolveSingleDoctorId(
                                    formOptions.doctors,
                                    serviceId,
                                ),
                            }));
                        }}
                        error={errors.service_id}
                        id="appointment-service_id"
                    />

                    {selectedService ? (
                        <InfoBadge>
                            Duración:{' '}
                            {selectedService.duration_minutes ?? '—'} min
                            {' · Precio: '}
                            <CurrencyDisplay
                                value={selectedService.price}
                                empty="Consultar precio"
                            />
                        </InfoBadge>
                    ) : null}

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="min-w-0">
                            <FormCombobox
                                label="Doctor"
                                required
                                placeholder={
                                    formState.serviceId === ''
                                        ? 'Selecciona un servicio primero'
                                        : 'Buscar doctor…'
                                }
                                searchPlaceholder="Buscar doctor…"
                                emptyMessage={
                                    formState.serviceId === ''
                                        ? 'Selecciona un servicio.'
                                        : 'Ningún doctor presta este servicio.'
                                }
                                options={doctorOptions}
                                value={resolvedDoctorId}
                                onValueChange={(doctorId) =>
                                    setFormState((current) => ({
                                        ...current,
                                        doctorId,
                                    }))
                                }
                                error={errors.doctor_id}
                                id="appointment-doctor_id"
                            />
                        </div>

                        <div className="min-w-0">
                            <AppointmentScheduleField
                                value={{
                                    appointmentDate: formState.appointmentDate,
                                    startsAtTime: formState.startsAtTime,
                                }}
                                onChange={({ appointmentDate, startsAtTime }) =>
                                    setFormState((current) => ({
                                        ...current,
                                        appointmentDate,
                                        startsAtTime,
                                    }))
                                }
                                durationMinutes={
                                    selectedService?.duration_minutes ?? null
                                }
                                doctorScheduleWindows={doctorScheduleWindows}
                                holidays={holidays}
                                validateSelection={scheduleValidationEnabled}
                                required
                                error={
                                    errors.appointment_date ??
                                    errors.starts_at_time
                                }
                                id="appointment-scheduled-at"
                            />
                        </div>
                    </div>

                    {officeOptions.length > 1 ? (
                        <FormCombobox
                            label="Sucursal"
                            placeholder="Opcional"
                            searchPlaceholder="Buscar sucursal…"
                            emptyMessage="No hay sucursales configuradas."
                            options={officeOptions}
                            value={formState.officeId}
                            onValueChange={(officeId) =>
                                setFormState((current) => ({
                                    ...current,
                                    officeId,
                                }))
                            }
                            error={errors.office_id}
                            id="appointment-office_id"
                        />
                    ) : null}

                    <FormTextarea
                        label="Notas internas"
                        error={errors.notes}
                        textareaProps={{
                            id: 'appointment-notes',
                            name: 'notes',
                            rows: 3,
                            placeholder: 'Observaciones para el equipo clínico.',
                        }}
                    />

                    <FormDialogFooter
                        onCancel={() => onOpenChange(false)}
                        processing={processing}
                        isEdit={false}
                        submitLabel="Agendar cita"
                    />
                </>
            )}
        </InertiaFormDialog>
    );
}
