import { useMemo, useState } from 'react';
import { CurrencyDisplay } from '@/components/custom/currency-display';
import { FormCombobox } from '@/components/custom/form-combobox';
import { FormDialogFooter } from '@/components/custom/form-dialog-footer';
import { FormTextarea } from '@/components/custom/form-textarea';
import type { CalendarHoliday } from '@/components/custom/full-calendar/types';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import { InfoBadge } from '@/components/custom/info-badge';
import { AppointmentCreatePatientDialog } from '@/pages/agenda/calendar/appointment-create-patient-dialog';
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
    AppointmentFormPatientOption,
} from '@/pages/agenda/calendar/types';

type AppointmentFormProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    formOptions: AppointmentFormOptions;
    defaults: AppointmentFormDefaults;
    holidays: CalendarHoliday[];
    canCreatePatient?: boolean;
    /** Si se define, tras crear la cita se vuelve al paciente en lugar del calendario. */
    redirectPatientId?: string;
};

export function AppointmentForm({
    open,
    onOpenChange,
    formOptions,
    defaults,
    holidays,
    canCreatePatient = false,
    redirectPatientId,
}: AppointmentFormProps) {
    const { formProps, headTitle, description } = useAppointmentForm();

    const [formState, setFormState] = useState(() =>
        buildInitialAppointmentFormState(formOptions, defaults),
    );
    const [createdPatients, setCreatedPatients] = useState<
        AppointmentFormPatientOption[]
    >([]);
    const [createPatientOpen, setCreatePatientOpen] = useState(false);

    const vaccinationDoseId = defaults.vaccinationDoseId ?? '';

    const availablePatients = useMemo(
        () => [...formOptions.patients, ...createdPatients],
        [formOptions.patients, createdPatients],
    );

    const patientSubjectOptions = useMemo(
        () =>
            availablePatients.map((option) => ({
                value: option.id,
                label: option.label,
                searchText: option.search_text,
            })),
        [availablePatients],
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

    const handleAppointmentOpenChange = (nextOpen: boolean) => {
        if (!nextOpen && createPatientOpen) {
            return;
        }

        if (!nextOpen) {
            setCreatePatientOpen(false);
            setCreatedPatients([]);
        }

        onOpenChange(nextOpen);
    };

    return (
        <>
            <InertiaFormDialog<AppointmentFormFields>
                open={open && !createPatientOpen}
                onOpenChange={handleAppointmentOpenChange}
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
                    {redirectPatientId ? (
                        <input
                            type="hidden"
                            name="redirect_patient_id"
                            value={redirectPatientId}
                        />
                    ) : null}
                    {vaccinationDoseId !== '' ? (
                        <input
                            type="hidden"
                            name="vaccination_dose_id"
                            value={vaccinationDoseId}
                        />
                    ) : null}

                    <FormCombobox
                        label="Cliente / paciente"
                        required
                        placeholder="Buscar por teléfono, documento, cliente o paciente…"
                        searchPlaceholder="Teléfono, documento, nombre o ficha…"
                        emptyMessage={
                            canCreatePatient
                                ? 'Sin coincidencias. Puedes registrar un paciente nuevo.'
                                : 'No hay pacientes activos registrados.'
                        }
                        emptyAction={
                            canCreatePatient
                                ? {
                                      label: 'Nuevo paciente',
                                      onSelect: () =>
                                          setCreatePatientOpen(true),
                                  }
                                : undefined
                        }
                        options={patientSubjectOptions}
                        value={resolvedPatientId}
                        onValueChange={(patientId) => {
                            const subject = availablePatients.find(
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

            <AppointmentCreatePatientDialog
                open={createPatientOpen}
                onOpenChange={setCreatePatientOpen}
                speciesOptions={formOptions.species ?? []}
                onCreated={(patient) => {
                    setCreatedPatients((current) => {
                        if (current.some((row) => row.id === patient.id)) {
                            return current;
                        }

                        return [...current, patient];
                    });
                    setFormState((current) => ({
                        ...current,
                        patientId: patient.id,
                        customerId: patient.customer_id,
                    }));
                    setCreatePatientOpen(false);
                }}
            />
        </>
    );
}
