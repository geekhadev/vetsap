import { Save } from 'lucide-react';
import { FormImageUpload } from '@/components/custom/form-image-upload';
import { FormSubmitButton } from '@/components/custom/form-submit-button';
import { FormTextInput } from '@/components/custom/form-text-input';
import { Separator } from '@/components/ui/separator';
import { useWebSiteForm } from '@/pages/configuration/companies/hooks/use-web-site-form';
import type { CompanyFormRecord } from '@/pages/configuration/companies/types';

type WebSiteTabPanelProps = {
    company: CompanyFormRecord;
};

export function WebSiteTabPanel({ company }: WebSiteTabPanelProps) {
    const { form, logoForm, logoPreviewUrl, submit, uploadLogo } = useWebSiteForm({
        companyId: company.id,
        slug: company.slug,
        webSettings: company.webSettings,
    });

    return (
        <form onSubmit={submit} className="space-y-6">
            <section className="space-y-4">
                <div className="grid items-start gap-8 lg:grid-cols-2">
                    <FormImageUpload
                        label="Logo"
                        previewUrl={logoPreviewUrl}
                        previewAlt="Logo de la clínica"
                        emptyLabel="Subir logo"
                        changeLabel="Cambiar logo"
                        error={logoForm.errors.logo}
                        processing={logoForm.processing}
                        helperText="Formatos permitidos: JPG, PNG, WebP. Tamaño máximo: 5 MB."
                        onFileSelect={uploadLogo}
                    />

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
                                        e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                                    ),
                            }}
                        />
                        <p className="text-muted-foreground text-sm">
                            Dirección web de tu clínica:{' '}
                            <span className="font-mono text-xs">
                                /clinica/<strong>{form.data.slug || '…'}</strong>
                            </span>
                        </p>
                    </div>
                </div>
            </section>

            <Separator />

            <section className="space-y-4">
                <div>
                    <h3 className="text-lg font-medium">Redes sociales y WhatsApp</h3>
                    <p className="text-muted-foreground text-sm">
                        Aparecen en el encabezado y pie de página de tu sitio web.
                    </p>
                </div>

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
                            onChange: (e) => form.setData('facebook_url', e.target.value),
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
                            onChange: (e) => form.setData('instagram_url', e.target.value),
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
                            onChange: (e) => form.setData('whatsapp_phone', e.target.value),
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
                            onChange: (e) => form.setData('whatsapp_message', e.target.value),
                        }}
                    />
                </div>
            </section>

            <Separator />

            <section className="space-y-4">
                <div>
                    <h3 className="text-lg font-medium">Mapa de contacto</h3>
                    <p className="text-muted-foreground text-sm">
                        Copia la URL del iframe de Google Maps (en Google Maps: Compartir → Insertar un mapa → copiar solo el valor del atributo <code>src</code>).
                    </p>
                </div>

                <FormTextInput
                    label="URL del mapa (src del iframe)"
                    error={form.errors.contact_map_url}
                    inputProps={{
                        id: 'contact_map_url',
                        name: 'contact_map_url',
                        placeholder: 'https://www.google.com/maps/embed?pb=…',
                        maxLength: 2000,
                        value: form.data.contact_map_url,
                        onChange: (e) => form.setData('contact_map_url', e.target.value),
                    }}
                />
            </section>

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
