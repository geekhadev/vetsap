import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import type {
    SplitSettingsAsideProps,
    SplitSettingsHeadingProps,
    SplitSettingsLayoutProps,
    SplitSettingsPanelProps,
} from './types';

export type {
    SplitSettingsAsideProps,
    SplitSettingsHeadingProps,
    SplitSettingsLayoutProps,
    SplitSettingsPanelProps,
} from './types';

export function SplitSettingsLayout({ children, className }: SplitSettingsLayoutProps) {
    return (
        <div
            className={cn(
                'grid min-w-0 w-full flex-1 grid-cols-1 gap-8 p-4',
                'lg:max-w-[1400px] lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-start lg:gap-x-12 lg:gap-y-8',
                className,
            )}
        >
            {children}
        </div>
    );
}

export function SplitSettingsAside({ children, className }: SplitSettingsAsideProps) {
    return (
        <aside className={cn('flex min-w-0 flex-col gap-4', className)}>{children}</aside>
    );
}

export function SplitSettingsHeading({
    title,
    description,
    className,
}: SplitSettingsHeadingProps) {
    return (
        <div className={cn('flex flex-col gap-2', className)}>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {description ? (
                <p className="text-muted-foreground text-sm">{description}</p>
            ) : null}
        </div>
    );
}

export function SplitSettingsPanel({
    children,
    className,
    contentClassName,
    unwrapped = false,
}: SplitSettingsPanelProps) {
    return (
        <Card className={cn('min-w-0 gap-0 py-0 shadow-xs', className)}>
            {unwrapped ? (
                <CardContent className={cn('p-6', contentClassName)}>{children}</CardContent>
            ) : (
                <CardContent className="flex min-h-0 flex-1 flex-col px-0">
                    <div className={cn('p-6', contentClassName)}>{children}</div>
                </CardContent>
            )}
        </Card>
    );
}
