import { AppointmentBookingForm } from './appointment/appointment-booking-form';
import { CLINIC_HERO_CTA_BUTTON } from './appointment/clinic-booking-theme';
import { mapPublicBookingSchedule } from './appointment/types';
import { buildClinicWhatsappUrl } from './clinic-whatsapp-url';
import { EditableText } from './editable-text';
import type { ClinicCompany, ClinicSettings, ClinicShowProps } from './types';

type ClinicHeroProps = {
    company: ClinicCompany;
    settings: ClinicSettings;
    bookingSchedule: ClinicShowProps['bookingSchedule'];
};

export function ClinicHero({ company, settings, bookingSchedule }: ClinicHeroProps) {
    const title = settings['hero_title'] ?? 'Cuidamos a tu mascota como si fuera nuestra';
    const subtitle =
        settings['hero_subtitle'] ??
        'Somos una clínica veterinaria comprometida con la salud y bienestar de tus mascotas. Atención profesional, cálida y personalizada.';
    const quote = settings['hero_quote'] ?? 'Tu mascota merece lo mejor, y nosotros estamos aquí para dárselo.';
    const whatsappUrl = buildClinicWhatsappUrl(settings);

    return (
        <section
            id="hero"
            className="relative flex min-h-[min(100svh,56rem)] overflow-hidden"
        >
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-0 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]"
            >
                <div className="absolute top-0 right-0 bottom-0 left-0 opacity-30 bg-[radial-gradient(circle_500px_at_50%_200px,#C9EBFF,transparent)]" />
            </div>
            <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-8 px-6 py-24 md:px-0 lg:grid lg:grid-cols-12 lg:gap-10 xl:gap-12">
                <div className="lg:col-span-6">
                    <EditableText
                        settingKey="hero_title"
                        value={title}
                        as="h1"
                        className="mb-4 max-w-xl text-4xl leading-tight font-bold tracking-tight text-balance text-cyan-500 sm:text-3xl lg:text-5xl"
                    />
                    <EditableText
                        settingKey="hero_subtitle"
                        value={subtitle}
                        as="p"
                        className="mb-6 max-w-xl text-balance font-light text-gray-500 md:text-base lg:mb-8 lg:text-lg"
                    />
                    <div className="flex gap-2">
                        <a
                            href={whatsappUrl ?? '#contacto'}
                            {...(whatsappUrl
                                ? { target: '_blank', rel: 'noopener noreferrer' }
                                : {})}
                            className={CLINIC_HERO_CTA_BUTTON}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="size-5 shrink-0"
                                aria-hidden
                            >
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Agendar por WhatsApp
                        </a>
                    </div>
                    <EditableText
                        settingKey="hero_quote"
                        value={quote}
                        as="p"
                        className="mt-6 max-w-xl border-l-4 border-cyan-400 pl-4 text-balance text-sm font-medium text-cyan-800 md:text-base"
                    />
                </div>
                <div className="order-first w-full lg:order-last lg:col-span-6">
                    <AppointmentBookingForm
                        companySlug={company.slug}
                        companyName={company.name}
                        companyAddress={company.address}
                        bookingSchedule={mapPublicBookingSchedule(bookingSchedule)}
                    />
                </div>
            </div>
        </section>
    );
}
