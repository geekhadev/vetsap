import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { ClinicAbout } from './clinic-about';
import { ClinicContact } from './clinic-contact';
import { ClinicEditorProvider } from './clinic-editor-context';
import { ClinicEditorToolbar } from './clinic-editor-toolbar';
import { ClinicFooter } from './clinic-footer';
import { ClinicGallery } from './clinic-gallery';
import { ClinicHeader } from './clinic-header';
import { ClinicHero } from './clinic-hero';
import { ClinicServices } from './clinic-services';
import { ClinicWhatsappButton } from './clinic-whatsapp-button';
import type { ClinicShowProps } from './types';

type ClinicSectionTone = 'white' | 'muted';

function ClinicSection({ tone, children }: { tone: ClinicSectionTone; children: ReactNode }) {
    const toneClass = tone === 'muted' ? 'bg-neutral-50/90' : 'bg-white';

    return <section className={`${toneClass} py-16 md:py-20`}>{children}</section>;
}

export default function ClinicShow() {
    const { company, settings, bookingSchedule, canEdit } = usePage<ClinicShowProps>().props;

    const hasGallery = [1, 2, 3, 4, 5, 6].some(
        (i) => settings[`gallery_image_${i}`] != null,
    );

    useEffect(() => {
        const html = document.documentElement;
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!prefersReducedMotion) {
            html.classList.add('scroll-smooth');
        }

        return () => {
            html.classList.remove('scroll-smooth');
        };
    }, []);

    const page = (
        <>
            <Head>
                <title>{`${company.name} — Agenda tu cita en línea | Vetsap`}</title>
                <meta
                    name="description"
                    content={`${company.name} — clínica veterinaria. Agenda tu cita en línea.`}
                />
            </Head>
            <div className="clinic-page flex min-h-screen flex-col bg-white [&_#hero]:scroll-mt-0 [&_[id]]:scroll-mt-24">
                <main className="flex flex-col">
                    <div className="relative">
                        <ClinicHeader logo={settings['logo']} companyName={company.name} />
                        <ClinicHero
                            company={company}
                            settings={settings}
                            bookingSchedule={bookingSchedule}
                        />
                    </div>
                    <ClinicSection tone="muted">
                        <ClinicServices settings={settings} />
                    </ClinicSection>
                    <ClinicSection tone="white">
                        <ClinicAbout settings={settings} />
                    </ClinicSection>
                    {(hasGallery || canEdit) && (
                        <ClinicSection tone="muted">
                            <ClinicGallery settings={settings} />
                        </ClinicSection>
                    )}
                    <ClinicSection tone="white">
                        <ClinicContact company={company} settings={settings} />
                    </ClinicSection>
                </main>
                <ClinicWhatsappButton settings={settings} />
                {canEdit && <ClinicEditorToolbar />}
                <ClinicFooter company={company} settings={settings} />
            </div>
        </>
    );

    if (!canEdit) {
return page;
}

    return <ClinicEditorProvider slug={company.slug}>{page}</ClinicEditorProvider>;
}
