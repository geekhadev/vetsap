import { Head } from '@inertiajs/react';
import { useEffect } from 'react';
import { LandingCta } from '@/pages/landing/landing-cta';
import { LandingFaq } from '@/pages/landing/landing-faq';
import { LandingFeatures } from '@/pages/landing/landing-features';
import { LandingFooter } from '@/pages/landing/landing-footer';
import { LandingHeader } from '@/pages/landing/landing-header';
import { LandingHero } from '@/pages/landing/landing-hero';
import { LandingPricing } from '@/pages/landing/landing-pricing';
import { LandingSection } from '@/pages/landing/landing-section';
import { LandingWhatsappButton } from '@/pages/landing/landing-whatsapp-button';

export default function LandingIndex({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
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

    return (
        <div id="top" className="landing-page flex min-h-screen flex-col bg-white text-gray-900 [&_[id]]:scroll-mt-24">
            <Head>
                <title>Vetsap — ERP para veterinarios</title>
                <meta
                    name="description"
                    content="Software para clínicas veterinarias: página web, citas en línea, gestión de pacientes y boletas electrónicas SII."
                />
            </Head>
            <main className="flex flex-col">
                <div className="relative">
                    <LandingHeader canRegister={canRegister} />
                    <LandingHero canRegister={canRegister} />
                </div>
                <LandingSection tone="white" className="overflow-visible">
                    <LandingFeatures />
                </LandingSection>
                <LandingSection tone="muted">
                    <LandingPricing canRegister={canRegister} />
                </LandingSection>
                <LandingSection tone="white">
                    <LandingFaq />
                </LandingSection>
                <LandingSection tone="white">
                    <LandingCta canRegister={canRegister} />
                </LandingSection>
            </main>
            <LandingFooter />
            <LandingWhatsappButton />
        </div>
    );
}
