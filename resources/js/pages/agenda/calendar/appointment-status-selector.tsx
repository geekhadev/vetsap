import { Check, ChevronDown, Loader2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { appointmentStatusColorToDotClass } from '@/lib/appointment-status-colors';
import { cn } from '@/lib/utils';
import type {
    AppointmentDetailStatus,
    AppointmentStatusOption,
} from '@/pages/agenda/calendar/types';

type AppointmentStatusSelectorProps = {
    currentStatus: AppointmentDetailStatus;
    statuses: AppointmentStatusOption[];
    disabled?: boolean;
    changing?: boolean;
    onStatusChange: (statusId: string) => void;
};

export function AppointmentStatusSelector({
    currentStatus,
    statuses,
    disabled = false,
    changing = false,
    onStatusChange,
}: AppointmentStatusSelectorProps) {
    const statusDotClass = appointmentStatusColorToDotClass(currentStatus.color);
    const isInteractive = !disabled && !changing;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={!isInteractive}>
                <button
                    type="button"
                    className={cn(
                        'flex w-full items-center justify-between gap-3 rounded-md border px-3 py-2 text-left text-sm',
                        isInteractive
                            ? 'cursor-pointer hover:bg-muted/50'
                            : 'cursor-default opacity-80',
                    )}
                    aria-label="Cambiar estado de la cita"
                >
                    <span className="flex min-w-0 items-center gap-2">
                        {changing ? (
                            <Loader2
                                aria-hidden
                                className="size-2.5 shrink-0 animate-spin text-muted-foreground"
                            />
                        ) : (
                            <span
                                aria-hidden
                                className={cn(
                                    'size-2.5 shrink-0 rounded-full',
                                    statusDotClass,
                                )}
                            />
                        )}
                        <span className="truncate">
                            Cita · {currentStatus.name}
                        </span>
                    </span>
                    {isInteractive ? (
                        <ChevronDown
                            aria-hidden
                            className="size-4 shrink-0 text-muted-foreground"
                        />
                    ) : null}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
                {statuses.map((status) => {
                    const isCurrent = status.id === currentStatus.id;
                    const dotClass = appointmentStatusColorToDotClass(
                        status.color,
                    );

                    return (
                        <DropdownMenuItem
                            key={status.id}
                            disabled={isCurrent}
                            onSelect={() => onStatusChange(status.id)}
                            className="gap-2"
                        >
                            <span
                                aria-hidden
                                className={cn(
                                    'size-2.5 shrink-0 rounded-full',
                                    dotClass,
                                )}
                            />
                            <span className="min-w-0 flex-1 truncate">
                                {status.name}
                            </span>
                            {isCurrent ? (
                                <Check
                                    aria-hidden
                                    className="size-4 shrink-0 text-primary"
                                />
                            ) : null}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
