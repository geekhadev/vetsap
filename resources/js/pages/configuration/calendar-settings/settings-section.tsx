import { Info } from 'lucide-react';
import type { ReactNode } from 'react';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

type SettingsSectionProps = {
    title: string;
    tooltip?: string;
    children: ReactNode;
    showSeparator?: boolean;
};

export function SettingsSection({
    title,
    tooltip,
    children,
    showSeparator = true,
}: SettingsSectionProps) {
    return (
        <>
            {showSeparator ? <Separator /> : null}
            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-base font-medium">{title}</h3>
                    {tooltip ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    className="text-muted-foreground hover:text-foreground inline-flex size-5 items-center justify-center rounded-full transition-colors"
                                    aria-label={`Información sobre ${title}`}
                                >
                                    <Info className="size-4" aria-hidden />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                                {tooltip}
                            </TooltipContent>
                        </Tooltip>
                    ) : (
                        <Info
                            className="text-muted-foreground size-4"
                            aria-hidden
                        />
                    )}
                </div>
                {children}
            </section>
        </>
    );
}
