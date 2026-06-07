import { Head } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { useState } from 'react';
import { FormSelect } from '@/components/custom/form-select';
import { FormSubmitButton } from '@/components/custom/form-submit-button';
import { FormTimePickerField } from '@/components/custom/form-time-picker-field';
import { Card, CardContent } from '@/components/ui/card';
import {
    CALENDAR_SETTINGS_PAGE,
    DEFAULT_SERVICE_OPTIONS,
    TIME_BLOCK_OPTIONS,
} from '@/pages/configuration/calendar-settings/config';
import { GoogleCalendarConnectButton } from '@/pages/configuration/calendar-settings/google-calendar-connect-button';
import { SettingsSection } from '@/pages/configuration/calendar-settings/settings-section';
import { SettingsSwitchField } from '@/pages/configuration/calendar-settings/settings-switch-field';
import type { CalendarSettingsFormState } from '@/pages/configuration/calendar-settings/types';

const INITIAL_FORM_STATE: CalendarSettingsFormState = {
    startsAt: '09:00',
    endsAt: '19:00',
    timeBlockMinutes: '30',
    defaultServiceId: '',
    doctorNotifications: {
        onCreate: false,
        onConfirm: false,
        onCancel: true,
        onReschedule: true,
    },
    clientNotifications: {
        onCreate: true,
        onConfirm: true,
        onCancel: true,
        onReschedule: true,
        onPaymentIssued: true,
        onInvoiceIssued: true,
        onMedicalRecordAfterVisit: true,
        onPrescriptionAfterVisit: true,
    },
};

function CalendarSettingsIndex() {
    const [form, setForm] = useState<CalendarSettingsFormState>(
        INITIAL_FORM_STATE,
    );

    const updateDoctorNotification = (
        key: keyof CalendarSettingsFormState['doctorNotifications'],
        checked: boolean,
    ) => {
        setForm((current) => ({
            ...current,
            doctorNotifications: {
                ...current.doctorNotifications,
                [key]: checked,
            },
        }));
    };

    const updateClientNotification = (
        key: keyof CalendarSettingsFormState['clientNotifications'],
        checked: boolean,
    ) => {
        setForm((current) => ({
            ...current,
            clientNotifications: {
                ...current.clientNotifications,
                [key]: checked,
            },
        }));
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
    };

    return (
        <>
            <Head title={CALENDAR_SETTINGS_PAGE.title} />

            <div className="flex min-w-0 flex-1 flex-col gap-8 p-4 lg:flex-row lg:items-start lg:gap-12 lg:max-w-[1400px]">
                <div className="flex max-w-xs flex-col gap-4">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {CALENDAR_SETTINGS_PAGE.title}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {CALENDAR_SETTINGS_PAGE.description}
                    </p>
                </div>

                <Card className="min-w-0 flex-1 gap-0 py-0 shadow-xs">
                    <CardContent className="px-0">
                        <form onSubmit={handleSubmit} className="space-y-6 p-6">
                            <SettingsSection
                                title="Configuración del calendario"
                                showSeparator={false}
                                tooltip="Define el horario visible del calendario, el bloque de tiempo y el servicio predeterminado al agendar."
                            >
                                <div className="grid gap-4 sm:grid-cols-4">
                                    <FormTimePickerField
                                        label="Hora de inicio"
                                        required
                                        value={form.startsAt}
                                        onChange={(value) =>
                                            setForm((current) => ({
                                                ...current,
                                                startsAt: value,
                                            }))
                                        }
                                        minuteStep={15}
                                    />
                                    <FormTimePickerField
                                        label="Hora de cierre"
                                        required
                                        value={form.endsAt}
                                        onChange={(value) =>
                                            setForm((current) => ({
                                                ...current,
                                                endsAt: value,
                                            }))
                                        }
                                        minuteStep={15}
                                    />
                                    <FormSelect
                                        label="Bloque de tiempo"
                                        options={[...TIME_BLOCK_OPTIONS]}
                                        selectProps={{
                                            id: 'time_block_minutes',
                                            name: 'time_block_minutes',
                                            value: form.timeBlockMinutes,
                                            onChange: (event) =>
                                                setForm((current) => ({
                                                    ...current,
                                                    timeBlockMinutes:
                                                        event.target.value,
                                                })),
                                        }}
                                    />
                                    <FormSelect
                                        label="Servicio por defecto"
                                        placeholder=""
                                        options={[...DEFAULT_SERVICE_OPTIONS]}
                                        selectProps={{
                                            id: 'default_service_id',
                                            name: 'default_service_id',
                                            value: form.defaultServiceId,
                                            onChange: (event) =>
                                                setForm((current) => ({
                                                    ...current,
                                                    defaultServiceId:
                                                        event.target.value,
                                                })),
                                        }}
                                    />
                                </div>
                            </SettingsSection>

                            <SettingsSection
                                title="Notificaciones para doctores"
                                tooltip="Correos que recibirán los doctores según el evento de la cita."
                            >
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <SettingsSwitchField
                                        label="Enviar correo al crear una cita"
                                        checked={
                                            form.doctorNotifications.onCreate
                                        }
                                        onCheckedChange={(checked) =>
                                            updateDoctorNotification(
                                                'onCreate',
                                                checked,
                                            )
                                        }
                                    />
                                    <SettingsSwitchField
                                        label="Enviar correo al confirmar una cita"
                                        checked={
                                            form.doctorNotifications.onConfirm
                                        }
                                        onCheckedChange={(checked) =>
                                            updateDoctorNotification(
                                                'onConfirm',
                                                checked,
                                            )
                                        }
                                    />
                                    <SettingsSwitchField
                                        label="Enviar correo al cancelar una cita"
                                        checked={
                                            form.doctorNotifications.onCancel
                                        }
                                        onCheckedChange={(checked) =>
                                            updateDoctorNotification(
                                                'onCancel',
                                                checked,
                                            )
                                        }
                                    />
                                    <SettingsSwitchField
                                        label="Enviar correo al reagendar una cita"
                                        checked={
                                            form.doctorNotifications
                                                .onReschedule
                                        }
                                        onCheckedChange={(checked) =>
                                            updateDoctorNotification(
                                                'onReschedule',
                                                checked,
                                            )
                                        }
                                    />
                                </div>
                            </SettingsSection>

                            <SettingsSection
                                title="Notificaciones para clientes"
                                tooltip="Correos que recibirán los clientes según el evento de la cita o la atención."
                            >
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <SettingsSwitchField
                                        label="Enviar correo al crear una cita"
                                        checked={
                                            form.clientNotifications.onCreate
                                        }
                                        onCheckedChange={(checked) =>
                                            updateClientNotification(
                                                'onCreate',
                                                checked,
                                            )
                                        }
                                    />
                                    <SettingsSwitchField
                                        label="Enviar correo al confirmar una cita"
                                        checked={
                                            form.clientNotifications.onConfirm
                                        }
                                        onCheckedChange={(checked) =>
                                            updateClientNotification(
                                                'onConfirm',
                                                checked,
                                            )
                                        }
                                    />
                                    <SettingsSwitchField
                                        label="Enviar correo al cancelar una cita"
                                        checked={
                                            form.clientNotifications.onCancel
                                        }
                                        onCheckedChange={(checked) =>
                                            updateClientNotification(
                                                'onCancel',
                                                checked,
                                            )
                                        }
                                    />
                                    <SettingsSwitchField
                                        label="Enviar correo al reagendar una cita"
                                        checked={
                                            form.clientNotifications
                                                .onReschedule
                                        }
                                        onCheckedChange={(checked) =>
                                            updateClientNotification(
                                                'onReschedule',
                                                checked,
                                            )
                                        }
                                    />
                                    <SettingsSwitchField
                                        label="Enviar correo al emitir un pago"
                                        checked={
                                            form.clientNotifications
                                                .onPaymentIssued
                                        }
                                        onCheckedChange={(checked) =>
                                            updateClientNotification(
                                                'onPaymentIssued',
                                                checked,
                                            )
                                        }
                                    />
                                    <SettingsSwitchField
                                        label="Enviar correo al emitir una factura"
                                        checked={
                                            form.clientNotifications
                                                .onInvoiceIssued
                                        }
                                        onCheckedChange={(checked) =>
                                            updateClientNotification(
                                                'onInvoiceIssued',
                                                checked,
                                            )
                                        }
                                    />
                                    <SettingsSwitchField
                                        label="Enviar correo con ficha médica al finalizar la atención"
                                        checked={
                                            form.clientNotifications
                                                .onMedicalRecordAfterVisit
                                        }
                                        onCheckedChange={(checked) =>
                                            updateClientNotification(
                                                'onMedicalRecordAfterVisit',
                                                checked,
                                            )
                                        }
                                    />
                                    <SettingsSwitchField
                                        label="Enviar correo con receta al finalizar la atención"
                                        checked={
                                            form.clientNotifications
                                                .onPrescriptionAfterVisit
                                        }
                                        onCheckedChange={(checked) =>
                                            updateClientNotification(
                                                'onPrescriptionAfterVisit',
                                                checked,
                                            )
                                        }
                                    />
                                </div>
                            </SettingsSection>

                            <SettingsSection
                                title="Sincronización con Google Calendar"
                                tooltip="Conecta tu cuenta de Google para sincronizar las citas con Google Calendar."
                            >
                                <GoogleCalendarConnectButton />
                            </SettingsSection>

                            <div className="flex justify-end pt-2">
                                <FormSubmitButton
                                    type="submit"
                                    icon={<Save />}
                                    label="Guardar configuración"
                                    labelLoading="Guardando…"
                                    containerClassName="w-auto"
                                />
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

export default CalendarSettingsIndex;
