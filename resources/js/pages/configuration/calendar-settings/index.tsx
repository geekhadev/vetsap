import { Head, usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import { FormSelect } from '@/components/custom/form-select';
import { FormTimePickerField } from '@/components/custom/form-time-picker-field';
import { Card, CardContent } from '@/components/ui/card';
import { CALENDAR_SETTINGS_PAGE, TIME_BLOCK_OPTIONS } from '@/pages/configuration/calendar-settings/config';
import { useCalendarSettingsForm } from '@/pages/configuration/calendar-settings/hooks/use-calendar-settings-form';
import { SettingsSection } from '@/pages/configuration/calendar-settings/settings-section';
import { SettingsSwitchField } from '@/pages/configuration/calendar-settings/settings-switch-field';
import type { CalendarSettingsIndexPageProps } from '@/pages/configuration/calendar-settings/types';

function CalendarSettingsIndex() {
    const { companyMissing, services } =
        usePage<CalendarSettingsIndexPageProps>().props;
    const { form } = useCalendarSettingsForm();

    const serviceOptions = useMemo(
        () => [
            { value: '', label: 'Servicio por defecto' },
            ...services.map((service) => ({
                value: service.id,
                label: service.label,
            })),
        ],
        [services],
    );

    if (companyMissing) {
        return (
            <>
                <Head title={CALENDAR_SETTINGS_PAGE.title} />
                <div className="p-4">
                    <p className="text-muted-foreground text-sm">
                        Debes seleccionar una empresa para configurar el
                        calendario.
                    </p>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title={CALENDAR_SETTINGS_PAGE.title} />

            <div className="flex min-w-0 flex-1 flex-col gap-8 p-4 lg:max-w-[1400px] lg:flex-row lg:items-start lg:gap-12">
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
                        <div className="space-y-6 p-6">
                            <SettingsSection
                                title="Configuración del calendario"
                                showSeparator={false}
                                tooltip="Define el horario visible del calendario, el bloque de tiempo y el servicio predeterminado al agendar."
                            >
                                <div className="grid gap-4 sm:grid-cols-4">
                                    <FormTimePickerField
                                        label="Hora de inicio"
                                        required
                                        value={form.data.starts_at}
                                        onChange={(value) =>
                                            form.setData('starts_at', value)
                                        }
                                        error={form.errors.starts_at}
                                        minuteStep={15}
                                    />
                                    <FormTimePickerField
                                        label="Hora de cierre"
                                        required
                                        value={form.data.ends_at}
                                        onChange={(value) =>
                                            form.setData('ends_at', value)
                                        }
                                        error={form.errors.ends_at}
                                        minuteStep={15}
                                    />
                                    <FormSelect
                                        label="Bloque de tiempo"
                                        options={[...TIME_BLOCK_OPTIONS]}
                                        error={form.errors.time_block_minutes}
                                        selectProps={{
                                            id: 'time_block_minutes',
                                            name: 'time_block_minutes',
                                            value: form.data.time_block_minutes,
                                            onChange: (event) =>
                                                form.setData(
                                                    'time_block_minutes',
                                                    event.target.value,
                                                ),
                                        }}
                                    />
                                    <FormSelect
                                        label="Servicio por defecto"
                                        placeholder=""
                                        options={serviceOptions}
                                        error={form.errors.default_service_id}
                                        selectProps={{
                                            id: 'default_service_id',
                                            name: 'default_service_id',
                                            value: form.data.default_service_id,
                                            onChange: (event) =>
                                                form.setData(
                                                    'default_service_id',
                                                    event.target.value,
                                                ),
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
                                            form.data.doctor_notifications
                                                .on_create
                                        }
                                        onCheckedChange={(checked) =>
                                            form.setData(
                                                'doctor_notifications',
                                                {
                                                    ...form.data
                                                        .doctor_notifications,
                                                    on_create: checked,
                                                },
                                            )
                                        }
                                    />
                                    <SettingsSwitchField
                                        label="Enviar correo al confirmar una cita"
                                        checked={
                                            form.data.doctor_notifications
                                                .on_confirm
                                        }
                                        onCheckedChange={(checked) =>
                                            form.setData(
                                                'doctor_notifications',
                                                {
                                                    ...form.data
                                                        .doctor_notifications,
                                                    on_confirm: checked,
                                                },
                                            )
                                        }
                                    />
                                    <SettingsSwitchField
                                        label="Enviar correo al cancelar una cita"
                                        checked={
                                            form.data.doctor_notifications
                                                .on_cancel
                                        }
                                        onCheckedChange={(checked) =>
                                            form.setData(
                                                'doctor_notifications',
                                                {
                                                    ...form.data
                                                        .doctor_notifications,
                                                    on_cancel: checked,
                                                },
                                            )
                                        }
                                    />
                                    <SettingsSwitchField
                                        label="Enviar correo al reagendar una cita"
                                        checked={
                                            form.data.doctor_notifications
                                                .on_reschedule
                                        }
                                        onCheckedChange={(checked) =>
                                            form.setData(
                                                'doctor_notifications',
                                                {
                                                    ...form.data
                                                        .doctor_notifications,
                                                    on_reschedule: checked,
                                                },
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
                                            form.data.client_notifications
                                                .on_create
                                        }
                                        onCheckedChange={(checked) =>
                                            form.setData(
                                                'client_notifications',
                                                {
                                                    ...form.data
                                                        .client_notifications,
                                                    on_create: checked,
                                                },
                                            )
                                        }
                                    />
                                    <SettingsSwitchField
                                        label="Enviar correo al confirmar una cita"
                                        checked={
                                            form.data.client_notifications
                                                .on_confirm
                                        }
                                        onCheckedChange={(checked) =>
                                            form.setData(
                                                'client_notifications',
                                                {
                                                    ...form.data
                                                        .client_notifications,
                                                    on_confirm: checked,
                                                },
                                            )
                                        }
                                    />
                                    <SettingsSwitchField
                                        label="Enviar correo al cancelar una cita"
                                        checked={
                                            form.data.client_notifications
                                                .on_cancel
                                        }
                                        onCheckedChange={(checked) =>
                                            form.setData(
                                                'client_notifications',
                                                {
                                                    ...form.data
                                                        .client_notifications,
                                                    on_cancel: checked,
                                                },
                                            )
                                        }
                                    />
                                    <SettingsSwitchField
                                        label="Enviar correo al reagendar una cita"
                                        checked={
                                            form.data.client_notifications
                                                .on_reschedule
                                        }
                                        onCheckedChange={(checked) =>
                                            form.setData(
                                                'client_notifications',
                                                {
                                                    ...form.data
                                                        .client_notifications,
                                                    on_reschedule: checked,
                                                },
                                            )
                                        }
                                    />
                                    <SettingsSwitchField
                                        label="Enviar correo al emitir un pago"
                                        checked={
                                            form.data.client_notifications
                                                .on_payment_issued
                                        }
                                        onCheckedChange={(checked) =>
                                            form.setData(
                                                'client_notifications',
                                                {
                                                    ...form.data
                                                        .client_notifications,
                                                    on_payment_issued: checked,
                                                },
                                            )
                                        }
                                    />
                                    <SettingsSwitchField
                                        label="Enviar correo al emitir una factura"
                                        checked={
                                            form.data.client_notifications
                                                .on_invoice_issued
                                        }
                                        onCheckedChange={(checked) =>
                                            form.setData(
                                                'client_notifications',
                                                {
                                                    ...form.data
                                                        .client_notifications,
                                                    on_invoice_issued: checked,
                                                },
                                            )
                                        }
                                    />
                                    <SettingsSwitchField
                                        label="Enviar correo con ficha médica al finalizar la atención"
                                        checked={
                                            form.data.client_notifications
                                                .on_medical_record_after_visit
                                        }
                                        onCheckedChange={(checked) =>
                                            form.setData(
                                                'client_notifications',
                                                {
                                                    ...form.data
                                                        .client_notifications,
                                                    on_medical_record_after_visit:
                                                        checked,
                                                },
                                            )
                                        }
                                    />
                                    <SettingsSwitchField
                                        label="Enviar correo con receta al finalizar la atención"
                                        checked={
                                            form.data.client_notifications
                                                .on_prescription_after_visit
                                        }
                                        onCheckedChange={(checked) =>
                                            form.setData(
                                                'client_notifications',
                                                {
                                                    ...form.data
                                                        .client_notifications,
                                                    on_prescription_after_visit:
                                                        checked,
                                                },
                                            )
                                        }
                                    />
                                </div>
                            </SettingsSection>

                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

export default CalendarSettingsIndex;
