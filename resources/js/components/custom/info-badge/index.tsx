import { Info } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { InfoBadgeProps } from './types';

export type { InfoBadgeProps } from './types';

export function InfoBadge({ children, className }: InfoBadgeProps) {
    return (
        <div
            role="status"
            className={cn(
                'flex w-full items-start gap-2 rounded-md border border-blue-200/90 bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:border-blue-900/35 dark:bg-blue-950/45 dark:text-blue-200',
                className,
            )}
        >
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>{children}</span>
        </div>
    );
}
