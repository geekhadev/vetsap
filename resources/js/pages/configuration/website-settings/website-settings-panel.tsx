import { Save } from 'lucide-react';
import { FormHexColorInput } from '@/components/custom/form-hex-color-input';
import { FormImageUpload } from '@/components/custom/form-image-upload';
import { FormSubmitButton } from '@/components/custom/form-submit-button';
import { FormTextInput } from '@/components/custom/form-text-input';
import { SettingsSection } from '@/pages/configuration/calendar-settings/settings-section';
import { useWebsiteSettingsForm } from '@/pages/configuration/website-settings/hooks/use-website-settings-form';
import { CLINIC_DEFAULT_PRIMARY_COLOR } from '@/pages/web/clinic/clinic-theme';

export function WebsiteSettingsPanel() {
    const { form, logoForm, logoPreviewUrl, ogImageForm, ogImagePreviewUrl, submit, uploadLogo, uploadOgImage } =
        useWebsiteSettingsForm();

    return (
        <form onSubmit={submit} className="space-y-6">
            <SettingsSection
                title="Identidad y URL"
                showSeparator={false}
                tooltip="Define el logo, el color principal y la dirección web pública de tu clínica."
            >
                <div className="grid items-start gap-8 lg:grid-cols-2">
                    <div className="space-y-2">
                        <FormTextInput
                            label="Slug de URL"
                            required
                            error={form.errors.slug}
                            inputProps={{
                                id: 'slug',
                                name: 'slug',
                                placeholder: 'mi-clinica',
                                maxLength: 255,
                                value: form.data.slug,
                                onChange: (e) =>
                                    form.setData(
                                        'slug',
                                        e.target.value
                                            .toLowerCase()
                                            .replace(/[^a-z0-9-]/g, '-'),
                                    ),
                            }}
                        />
                        <p className="text-muted-foreground text-sm">
                            Dirección web de tu clínica:{' '}
                            <span className="font-mono text-xs">
                                /clinica/
                                <strong>{form.data.slug || '…'}</strong>
                            </span>
                        </p>
                    </div>

                    <FormHexColorInput
                        label="Color principal"
                        error={form.errors.primary_color}
                        fallbackColor={CLINIC_DEFAULT_PRIMARY_COLOR}
                        helperText="Se usa en el sitio público de la clínica (títulos, botones y acentos)."
                        inputProps={{
                            id: 'primary_color',
                            name: 'primary_color',
                            value: form.data.primary_color,
                            onChange: (value) =>
                                form.setData('primary_color', value),
                        }}
                    />
                </div>

                <div className="grid items-start gap-8 lg:grid-cols-2">
                    <FormImageUpload
                        label="Logo"
                        previewUrl={logoPreviewUrl}
                        previewAlt="Logo de la clínica"
                        emptyLabel="Subir logo"
                        changeLabel="Cambiar logo"
                        error={logoForm.errors.logo}
                        processing={logoForm.processing}
                        helperText="Formatos permitidos: JPG, PNG, WebP. Máx. 5 MB."
                        onFileSelect={uploadLogo}
                    />

                    <FormImageUpload
                        label="Imagen para compartir en redes (OG)"
                        previewUrl={ogImagePreviewUrl}
                        previewAlt="Imagen OG de la clínica"
                        emptyLabel="Subir imagen"
                        changeLabel="Cambiar imagen"
                        error={ogImageForm.errors.og_image}
                        processing={ogImageForm.processing}
                        helperText="Recomendado: 1200×630 px. JPG, PNG, WebP. Máx. 5 MB."
                        onFileSelect={uploadOgImage}
                    />
                </div>
            </SettingsSection>

            <SettingsSection
                title="Redes sociales y WhatsApp"
                tooltip="Aparecen en el encabezado y pie de página de tu sitio web."
            >
                <div className="grid gap-4 sm:grid-cols-2">
                    <FormTextInput
                        label="URL de Facebook"
                        error={form.errors.facebook_url}
                        inputProps={{
                            id: 'facebook_url',
                            name: 'facebook_url',
                            placeholder: 'https://facebook.com/tuclinica',
                            maxLength: 500,
                            value: form.data.facebook_url,
                            onChange: (e) =>
                                form.setData('facebook_url', e.target.value),
                        }}
                    />

                    <FormTextInput
                        label="URL de Instagram"
                        error={form.errors.instagram_url}
                        inputProps={{
                            id: 'instagram_url',
                            name: 'instagram_url',
                            placeholder: 'https://instagram.com/tuclinica',
                            maxLength: 500,
                            value: form.data.instagram_url,
                            onChange: (e) =>
                                form.setData('instagram_url', e.target.value),
                        }}
                    />

                    <FormTextInput
                        label="Número de WhatsApp"
                        error={form.errors.whatsapp_phone}
                        inputProps={{
                            id: 'whatsapp_phone',
                            name: 'whatsapp_phone',
                            placeholder: '56912345678',
                            maxLength: 30,
                            value: form.data.whatsapp_phone,
                            onChange: (e) =>
                                form.setData('whatsapp_phone', e.target.value),
                        }}
                    />

                    <FormTextInput
                        label="Mensaje de WhatsApp"
                        error={form.errors.whatsapp_message}
                        inputProps={{
                            id: 'whatsapp_message',
                            name: 'whatsapp_message',
                            placeholder: 'Hola, quisiera agendar una hora',
                            maxLength: 500,
                            value: form.data.whatsapp_message,
                            onChange: (e) =>
                                form.setData(
                                    'whatsapp_message',
                                    e.target.value,
                                ),
                        }}
                    />

                    <FormTextInput
                        label="Ubicación de la clínica (src del iframe de Google Maps)"
                        error={form.errors.contact_map_url}
                        inputProps={{
                            id: 'contact_map_url',
                            name: 'contact_map_url',
                            placeholder: 'https://www.google.com/maps/embed?pb=…',
                            maxLength: 2000,
                            value: form.data.contact_map_url,
                            onChange: (e) =>
                                form.setData('contact_map_url', e.target.value),
                        }}
                    />
                </div>
            </SettingsSection>

            <div className="flex flex-row flex-wrap items-center gap-3">
                <FormSubmitButton
                    type="submit"
                    loading={form.processing}
                    icon={<Save />}
                    label="Guardar"
                    labelLoading="Guardando…"
                    containerClassName="w-auto"
                />
            </div>
        </form>
    );
}
