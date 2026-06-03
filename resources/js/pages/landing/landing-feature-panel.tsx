import type { LandingFeature } from '@/pages/landing/landing-features-data';

type LandingFeaturePanelProps = {
    feature: LandingFeature;
};

export function LandingFeatureWindowChrome({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-2 border-b border-cyan-100/90 bg-linear-to-r from-neutral-50/95 to-cyan-50/40 px-4 py-2.5 sm:px-5">
            <span className="size-2 shrink-0 rounded-full bg-cyan-500" aria-hidden />
            <span className="truncate rounded-md bg-white/90 px-2.5 py-1 text-xs font-medium text-gray-600 shadow-xs ring-1 ring-cyan-100/80 sm:text-sm">
                {label}
            </span>
        </div>
    );
}

export function LandingFeaturePanel({ feature }: LandingFeaturePanelProps) {
    return (
        <div className="flex flex-col">
            <LandingFeatureWindowChrome label={feature.windowLabel} />
            <img
                src={feature.imageSrc}
                alt={feature.imageAlt}
                width={1200}
                height={720}
                className="aspect-4/3 w-full min-h-[15rem] object-cover object-center sm:min-h-[17rem] lg:aspect-16/9 lg:min-h-[22rem] xl:min-h-[26rem]"
            />
        </div>
    );
}
