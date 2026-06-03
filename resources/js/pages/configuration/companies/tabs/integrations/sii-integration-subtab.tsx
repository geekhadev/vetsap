import type { InertiaFormProps } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { FormDatePickerField } from '@/components/custom/form-date-picker-field';
import { FormFileInput } from '@/components/custom/form-file-input';
import { FormPasswordInputGroup } from '@/components/custom/form-password-input-group';
import { FormSubmitButton } from '@/components/custom/form-submit-button';
import { FormTextInput } from '@/components/custom/form-text-input';
import { Separator } from '@/components/ui/separator';
import type { SiiIntegrationFormData } from '@/pages/configuration/companies/tabs/integrations/sii-integration-keys';
import { SII_CERTIFICATE_FILE_FIELD } from '@/pages/configuration/companies/tabs/integrations/sii-integration-keys';

type SiiIntegrationSubtabProps = {
    form: InertiaFormProps<SiiIntegrationFormData>;
    onSubmit: (e: React.FormEvent) => void;
    siiCertificateDownloadUrl?: string | null;
};

export function SiiIntegrationSubtab({
    form,
    onSubmit,
    siiCertificateDownloadUrl = null,
}: SiiIntegrationSubtabProps) {
    return (
        <form onSubmit={onSubmit} className="w-full space-y-6">
            <div>
                <h3 className="text-lg font-medium">Certificación SII (general)</h3>
                <p className="text-muted-foreground text-sm">
                    Datos para la integración con el Servicio de Impuestos Internos.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <FormTextInput
                    label="Ciudad"
                    required
                    error={form.errors.configuration_integrations_sii_city}
                    inputProps={{
                        id: 'configuration_integrations_sii_city',
                        name: 'configuration_integrations_sii_city',
                        maxLength: 255,
                        value: form.data.configuration_integrations_sii_city,
                        onChange: (e) =>
                            form.setData(
                                'configuration_integrations_sii_city',
                                e.target.value,
                            ),
                    }}
                />

                <FormTextInput
                    label="Dirección"
                    required
                    error={form.errors.configuration_integrations_sii_direction}
                    inputProps={{
                        id: 'configuration_integrations_sii_direction',
                        name: 'configuration_integrations_sii_direction',
                        maxLength: 500,
                        value: form.data.configuration_integrations_sii_direction,
                        onChange: (e) =>
                            form.setData(
                                'configuration_integrations_sii_direction',
                                e.target.value,
                            ),
                    }}
                />

                <FormTextInput
                    label="Giro"
                    required
                    error={form.errors.configuration_integrations_sii_giro}
                    inputProps={{
                        id: 'configuration_integrations_sii_giro',
                        name: 'configuration_integrations_sii_giro',
                        maxLength: 255,
                        value: form.data.configuration_integrations_sii_giro,
                        onChange: (e) =>
                            form.setData(
                                'configuration_integrations_sii_giro',
                                e.target.value,
                            ),
                    }}
                />

                <FormTextInput
                    label="RUT representante legal"
                    required
                    error={
                        form.errors.configuration_integrations_sii_representante_legal_rut
                    }
                    inputProps={{
                        id: 'configuration_integrations_sii_representante_legal_rut',
                        name: 'configuration_integrations_sii_representante_legal_rut',
                        maxLength: 20,
                        value: form.data.configuration_integrations_sii_representante_legal_rut,
                        onChange: (e) =>
                            form.setData(
                                'configuration_integrations_sii_representante_legal_rut',
                                e.target.value,
                            ),
                    }}
                />

                <FormTextInput
                    label="Nombre representante legal"
                    required
                    error={
                        form.errors.configuration_integrations_sii_representante_legal_name
                    }
                    inputProps={{
                        id: 'configuration_integrations_sii_representante_legal_name',
                        name: 'configuration_integrations_sii_representante_legal_name',
                        maxLength: 255,
                        value: form.data.configuration_integrations_sii_representante_legal_name,
                        onChange: (e) =>
                            form.setData(
                                'configuration_integrations_sii_representante_legal_name',
                                e.target.value,
                            ),
                    }}
                />

                <FormTextInput
                    label="Código actividad económica (ACTECO)"
                    required
                    error={form.errors.configuration_integrations_sii_acteco}
                    inputProps={{
                        id: 'configuration_integrations_sii_acteco',
                        name: 'configuration_integrations_sii_acteco',
                        maxLength: 255,
                        value: form.data.configuration_integrations_sii_acteco,
                        onChange: (e) =>
                            form.setData(
                                'configuration_integrations_sii_acteco',
                                e.target.value,
                            ),
                    }}
                />

                <FormFileInput
                    label="Certificado digital (.pfx o .p12)"
                    required
                    error={
                        form.errors[SII_CERTIFICATE_FILE_FIELD]?.trim() ||
                        form.errors.configuration_integrations_sii_certificate_url?.trim() ||
                        undefined
                    }
                    labelAccessory={
                        siiCertificateDownloadUrl ? (
                            <a
                                href={siiCertificateDownloadUrl}
                                className="text-muted-foreground hover:text-foreground shrink-0 text-xs font-normal underline-offset-4 hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Descargar
                            </a>
                        ) : undefined
                    }
                    inputProps={{
                        id: SII_CERTIFICATE_FILE_FIELD,
                        name: SII_CERTIFICATE_FILE_FIELD,
                        placeholder: 'Certificado digital (.pfx o .p12)',
                        accept: '.pfx,.p12,application/x-pkcs12',
                        onChange: (e) => {
                            const file = e.target.files?.[0] ?? null;
                            form.setData(SII_CERTIFICATE_FILE_FIELD, file);
                        },
                    }}
                />

                <FormPasswordInputGroup
                    label="Contraseña del certificado"
                    required
                    placeholder="Contraseña del certificado"
                    error={
                        form.errors.configuration_integrations_sii_certificate_password
                    }
                    inputProps={{
                        id: 'configuration_integrations_sii_certificate_password',
                        name: 'configuration_integrations_sii_certificate_password',
                        maxLength: 255,
                        autoComplete: 'new-password',
                        value: form.data.configuration_integrations_sii_certificate_password,
                        onChange: (e) =>
                            form.setData(
                                'configuration_integrations_sii_certificate_password',
                                e.target.value,
                            ),
                    }}
                />

                <FormTextInput
                    label="Email de intercambio"
                    required
                    error={form.errors.configuration_integrations_sii_exchange_email}
                    placeholder="email@example.com"
                    inputProps={{
                        id: 'configuration_integrations_sii_exchange_email',
                        name: 'configuration_integrations_sii_exchange_email',
                        maxLength: 255,
                        type: 'email',
                        value: form.data.configuration_integrations_sii_exchange_email,
                        onChange: (e) =>
                            form.setData(
                                'configuration_integrations_sii_exchange_email',
                                e.target.value,
                            ),
                    }}
                />
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-3">
                <FormTextInput
                    label="Usuario portal SII"
                    error={form.errors.configuration_integrations_sii_portal_username}
                    inputProps={{
                        id: 'configuration_integrations_sii_portal_username',
                        name: 'configuration_integrations_sii_portal_username',
                        maxLength: 255,
                        value: form.data.configuration_integrations_sii_portal_username,
                        onChange: (e) =>
                            form.setData(
                                'configuration_integrations_sii_portal_username',
                                e.target.value,
                            ),
                    }}
                />

                <FormPasswordInputGroup
                    label="Contraseña portal SII"
                    error={form.errors.configuration_integrations_sii_portal_password}
                    inputProps={{
                        id: 'configuration_integrations_sii_portal_password',
                        name: 'configuration_integrations_sii_portal_password',
                        placeholder: 'Contraseña portal SII',
                        maxLength: 255,
                        autoComplete: 'new-password',
                        value: form.data.configuration_integrations_sii_portal_password,
                        onChange: (e) =>
                            form.setData(
                                'configuration_integrations_sii_portal_password',
                                e.target.value,
                            ),
                    }}
                />
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-3">

                <FormDatePickerField
                    label="Fecha resolución boletas"
                    disableFutureDates
                    error={form.errors.configuration_integrations_sii_resolution_date_tickets}
                    id="configuration_integrations_sii_resolution_date_tickets"
                    value={form.data.configuration_integrations_sii_resolution_date_tickets}
                    onChange={(next) =>
                        form.setData('configuration_integrations_sii_resolution_date_tickets', next)
                    }
                />

                <FormTextInput
                    label="Número resolución boletas"
                    error={
                        form.errors.configuration_integrations_sii_resolution_number_tickets
                    }
                    inputProps={{
                        id: 'configuration_integrations_sii_resolution_number_tickets',
                        name: 'configuration_integrations_sii_resolution_number_tickets',
                        maxLength: 255,
                        value: form.data.configuration_integrations_sii_resolution_number_tickets,
                        onChange: (e) =>
                            form.setData(
                                'configuration_integrations_sii_resolution_number_tickets',
                                e.target.value,
                            ),
                    }}
                />

                <FormTextInput
                    label="Email de certificación boletas"
                    error={
                        form.errors.configuration_integrations_sii_certification_email_tickets
                    }
                    inputProps={{
                        id: 'configuration_integrations_sii_certification_email_tickets',
                        name: 'configuration_integrations_sii_certification_email_tickets',
                        maxLength: 255,
                        value: form.data.configuration_integrations_sii_certification_email_tickets,
                        onChange: (e) =>
                            form.setData(
                                'configuration_integrations_sii_certification_email_tickets',
                                e.target.value,
                            ),
                    }}
                />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">

                <FormDatePickerField
                    label="Fecha resolución facturas"
                    disableFutureDates
                    error={form.errors.configuration_integrations_sii_resolution_date_invoices}
                    id="configuration_integrations_sii_resolution_date_invoices"
                    value={form.data.configuration_integrations_sii_resolution_date_invoices}
                    onChange={(next) =>
                        form.setData(
                            'configuration_integrations_sii_resolution_date_invoices',
                            next,
                        )
                    }
                />

                <FormTextInput
                    label="Número resolución facturas"
                    error={
                        form.errors.configuration_integrations_sii_resolution_number_invoices
                    }
                    inputProps={{
                        id: 'configuration_integrations_sii_resolution_number_invoices',
                        name: 'configuration_integrations_sii_resolution_number_invoices',
                        maxLength: 255,
                        value: form.data.configuration_integrations_sii_resolution_number_invoices,
                        onChange: (e) =>
                            form.setData(
                                'configuration_integrations_sii_resolution_number_invoices',
                                e.target.value,
                            ),
                    }}
                />

                <FormTextInput
                    label="Email de certificación facturas"
                    error={
                        form.errors.configuration_integrations_sii_certification_email_invoices
                    }
                    inputProps={{
                        id: 'configuration_integrations_sii_certification_email_invoices',
                        name: 'configuration_integrations_sii_certification_email_invoices',
                        maxLength: 255,
                        value: form.data.configuration_integrations_sii_certification_email_invoices,
                        onChange: (e) =>
                            form.setData(
                                'configuration_integrations_sii_certification_email_invoices',
                                e.target.value,
                            ),
                    }}
                />
            </div>

            <div className="flex flex-row flex-wrap items-center gap-3">
                <FormSubmitButton
                    type="submit"
                    loading={form.processing}
                    icon={<Save />}
                    label="Guardar integración SII"
                    labelLoading="Guardando…"
                    containerClassName="w-auto"
                />
            </div>
        </form>
    );
}
