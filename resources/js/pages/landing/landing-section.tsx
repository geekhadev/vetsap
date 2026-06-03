import type { ReactNode } from 'react';

type LandingSectionTone = 'white' | 'muted';

type LandingSectionProps = {
    tone: LandingSectionTone;
    children: ReactNode;
    className?: string;
};

export function LandingSection({ tone, children, className = '' }: LandingSectionProps) {
    const toneClass = tone === 'muted' ? 'bg-neutral-50/90' : 'bg-white';

    return (
        <section className={`scroll-mt-24 py-16 md:py-24 ${toneClass} ${className}`}>{children}</section>
    );
}
