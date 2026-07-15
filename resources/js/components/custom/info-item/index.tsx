import { cn } from '@/lib/utils';

import type { InfoItemProps } from './types';

export type { InfoItemProps } from './types';

export function InfoItem({ label, children, className, icon: Icon }: InfoItemProps) {
    if (Icon) {
        return (
            <div className={cn('flex gap-2.5', className)}>
                <Icon
                    className="text-muted-foreground mt-0.5 size-4 shrink-0"
                    aria-hidden
                />
                <div className="flex min-w-0 flex-col gap-0.5">
                    <dt className="text-sm font-medium">{label}</dt>
                    <dd className="text-muted-foreground text-sm">{children}</dd>
                </div>
            </div>
        );
    }

    return (
        <div className={cn('flex flex-col gap-1', className)}>
            <dt className="text-muted-foreground text-sm">{label}</dt>
            <dd className="text-sm">{children}</dd>
        </div>
    );
}
