import { cn } from '@/lib/utils';

import type { InfoItemProps } from './types';

export type { InfoItemProps } from './types';

export function InfoItem({ label, children, className }: InfoItemProps) {
    return (
        <div className={cn('flex flex-col gap-1', className)}>
            <dt className="text-muted-foreground text-sm">{label}</dt>
            <dd className="text-sm">{children}</dd>
        </div>
    );
}
