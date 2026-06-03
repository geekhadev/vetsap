import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type LandingBackgroundProps = {
    children: ReactNode;
    className?: string;
};

const backgroundFadeMask =
    '[mask-image:linear-gradient(to_bottom,black_0%,black_42%,transparent_92%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_42%,transparent_92%)] [mask-size:100%_100%] [-webkit-mask-size:100%_100%]';

export function LandingBackground({ children, className = '' }: LandingBackgroundProps) {
    return (
        <div className={cn('relative overflow-hidden', className)}>
            <div
                aria-hidden
                className={cn(
                    'pointer-events-none absolute inset-0 z-0 h-full w-full',
                    backgroundFadeMask,
                )}
            >
                <div className="absolute inset-0 bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#C9EBFF,transparent)] opacity-30" />
            </div>
            <div className="relative z-10">{children}</div>
        </div>
    );
}
