import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { StatusPillBadgeProps, StatusPillTone } from './types';

export type { StatusPillBadgeProps, StatusPillTone } from './types';

const STATUS_PILL_TONE_CLASS: Record<StatusPillTone, string> = {
    positive:
        'border-green-200/90 bg-green-50 text-green-800 dark:border-green-900/35 dark:bg-green-950/45 dark:text-green-200',
    negative:
        'border-amber-200/90 bg-amber-50 text-amber-800 dark:border-amber-900/35 dark:bg-amber-950/45 dark:text-amber-200',
    warning:
        'border-orange-200/90 bg-orange-50 text-orange-800 dark:border-orange-900/35 dark:bg-orange-950/45 dark:text-orange-200',
    danger:
        'border-red-200/90 bg-red-50 text-red-800 dark:border-red-900/35 dark:bg-red-950/45 dark:text-red-200',
    neutral:
        'border-slate-200/90 bg-slate-50 text-slate-600 dark:border-slate-700/60 dark:bg-slate-900/45 dark:text-slate-400',
};

export function StatusPillBadge({
    icon: Icon,
    tone,
    children,
    className,
}: StatusPillBadgeProps) {
    return (
        <Badge
            variant="outline"
            className={cn(
                'gap-1 rounded-full px-2.5 py-0.5 font-normal [&>svg]:size-3',
                STATUS_PILL_TONE_CLASS[tone],
                className,
            )}
        >
            <Icon aria-hidden />
            {children}
        </Badge>
    );
}
