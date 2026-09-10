import { usePage } from '@inertiajs/react';
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
    const { vetsap } = usePage().props;
    const showPricing = vetsap.landing.show_pricing;

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
            <main className="flex flex-col">
                <div className="relative">
                    <LandingHeader canRegister={canRegister} />
                    <LandingHero canRegister={canRegister} />
                </div>
                <LandingSection tone="white" className="overflow-x-clip">
                    <LandingFeatures />
                </LandingSection>
                {showPricing ? (
                    <LandingSection tone="muted">
                        <LandingPricing canRegister={canRegister} />
                    </LandingSection>
                ) : null}
                <LandingSection tone={showPricing ? 'white' : 'muted'}>
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
