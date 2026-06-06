import { CircleAlert, CircleCheck  } from 'lucide-react';
import type {LucideIcon} from 'lucide-react';
import { StatusPillBadge } from '@/components/custom/status-pill-badge';
import { formatConfiguredStatus } from '@/types/table-status-columns';

export type ConfiguredStatusBadgeProps = {
    configured: boolean;
    icon?: LucideIcon;
    className?: string;
};

export function ConfiguredStatusBadge({
    configured,
    icon: ConfiguredIcon = CircleCheck,
    className,
}: ConfiguredStatusBadgeProps) {
    if (configured) {
        return (
            <StatusPillBadge
                icon={ConfiguredIcon}
                tone="positive"
                className={className}
            >
                {formatConfiguredStatus(true)}
            </StatusPillBadge>
        );
    }

    return (
        <StatusPillBadge
            icon={CircleAlert}
            tone="negative"
            className={className}
        >
            {formatConfiguredStatus(false)}
        </StatusPillBadge>
    );
}
