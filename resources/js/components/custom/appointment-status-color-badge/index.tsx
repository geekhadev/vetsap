import { Badge } from '@/components/ui/badge';
import { APPOINTMENT_STATUS_COLOR_BADGE_CLASS } from '@/lib/appointment-status-colors';
import { cn } from '@/lib/utils';
import type { AppointmentStatusColorBadgeProps } from './types';

export type { AppointmentStatusColorBadgeProps } from './types';

export function AppointmentStatusColorBadge({
    color,
    label,
    className,
}: AppointmentStatusColorBadgeProps) {
    return (
        <Badge
            variant="outline"
            className={cn(
                'rounded-full px-2.5 py-0.5 font-normal',
                APPOINTMENT_STATUS_COLOR_BADGE_CLASS[color],
                className,
            )}
        >
            {label}
        </Badge>
    );
}
