import { Check } from 'lucide-react';
import type { LandingFeature } from '@/pages/landing/landing-features-data';

type LandingFeatureCopyProps = {
    feature: LandingFeature;
};

export function LandingFeatureCopy({ feature }: LandingFeatureCopyProps) {
    return (
        <div className="flex flex-col gap-4">
            <h3 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">{feature.title}</h3>
            <p className="max-w-xl text-balance leading-relaxed text-gray-600 md:text-lg">{feature.description}</p>
            <ul className="flex flex-col gap-3">
                {feature.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2.5 text-gray-700">
                        <Check className="mt-0.5 size-4 shrink-0 text-cyan-600" aria-hidden />
                        <span>{bullet}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
