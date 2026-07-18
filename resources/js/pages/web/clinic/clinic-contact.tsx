import { Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { resolveGoogleMapsEmbedSrc } from '@/lib/google-maps-embed';
import { EditableHours } from './editable-hours';
import { EditableText } from './editable-text';
import type { ClinicCompany, ClinicSettings } from './types';

const DEFAULT_CONTACT_HOURS = ['Lunes a Viernes: 09:00 — 19:00', 'Sábados: 09:00 — 14:00'].join('\n');

function ContactMap({ src }: { src: string }) {
    return (
        <iframe
            src={src}
            width="650"
            height="450"
            className="h-[300px] w-full shadow-2xl sm:h-[450px]"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Ubicación de la clínica"
        />
    );
}

type ClinicContactProps = {
    company: ClinicCompany;
    settings: ClinicSettings;
};

export function ClinicContact({ company, settings }: ClinicContactProps) {
    const pretitle = settings['contact_pretitle'] ?? 'Para urgencias fuera de horario, contáctanos directamente.';
    const title = settings['contact_title'] ?? 'Contáctanos';
    const hoursTitle = settings['contact_hours_title'] ?? 'Horario de Atención';
    const legacyHours = [settings['contact_hours_weekday'], settings['contact_hours_saturday']]
        .filter((line): line is string => line != null && line.trim() !== '')
        .join('\n');
    const hours = settings['contact_hours'] ?? (legacyHours !== '' ? legacyHours : DEFAULT_CONTACT_HOURS);
    const facebookUrl = settings['facebook_url'];
    const instagramUrl = settings['instagram_url'];
    const hasSocial = facebookUrl != null || instagramUrl != null;

    const configuredMapSrc = resolveGoogleMapsEmbedSrc(settings['contact_map_url'] ?? '');
    const mapSrc =
        configuredMapSrc ??
        (company.address
            ? `https://maps.google.com/maps?q=${encodeURIComponent(company.address)}&output=embed`
            : null);
    const hasMap = mapSrc != null;

    return (
        <div className="mx-auto w-full max-w-7xl px-6 md:px-0" id="contacto">
            <div className="grid grid-cols-1 md:grid-cols-4">
                {hasMap && (
                    <div className="col-span-4 hidden md:col-span-2 md:block">
                        <ContactMap src={mapSrc!} />
                    </div>
                )}

                <div
                    className={`order-first col-span-4 flex flex-col justify-center gap-6 ${
                        hasMap ? 'md:col-span-2 md:ml-24 lg:order-last' : ''
                    }`}
                >
                    <EditableText
                        settingKey="contact_pretitle"
                        value={pretitle}
                        as="span"
                        className="text-gray-600"
                    />

                    <EditableText
                        settingKey="contact_title"
                        value={title}
                        as="h3"
                        className="text-5xl tracking-tight text-clinic-500"
                    />

                    {hasSocial && (
                        <div className="flex gap-2">
                            {facebookUrl && (
                                <a
                                    href={facebookUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white shadow-sm transition-colors hover:bg-gray-50"
                                    aria-label="Facebook"
                                >
                                    <Facebook size={16} />
                                </a>
                            )}
                            {instagramUrl && (
                                <a
                                    href={instagramUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white shadow-sm transition-colors hover:bg-gray-50"
                                    aria-label="Instagram"
                                >
                                    <Instagram size={16} />
                                </a>
                            )}
                        </div>
                    )}

                    {hasMap && (
                        <div className="block md:hidden">
                            <ContactMap src={mapSrc!} />
                        </div>
                    )}

                    <div className="flex flex-col gap-1">
                        <EditableText
                            settingKey="contact_hours_title"
                            value={hoursTitle}
                            as="p"
                            className="font-bold"
                        />
                        <EditableHours settingKey="contact_hours" value={hours} />
                    </div>

                    {(company.email || company.phone || company.address) && (
                        <div className="flex flex-col gap-2">
                            <p className="font-bold">Datos de contacto</p>
                            <div className="flex flex-col gap-1.5">
                                {company.email && (
                                    <span className="flex items-center gap-2 font-light text-gray-800">
                                        <Mail size={20} className="shrink-0 text-gray-600" />
                                        {company.email}
                                    </span>
                                )}
                                {company.phone && (
                                    <span className="flex items-center gap-2 font-light text-gray-800">
                                        <Phone size={20} className="shrink-0 text-gray-600" />
                                        {company.phone}
                                    </span>
                                )}
                                {company.address && (
                                    <span className="flex items-center gap-2 font-light text-gray-800">
                                        <MapPin size={20} className="shrink-0 text-gray-600" />
                                        {company.address}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
