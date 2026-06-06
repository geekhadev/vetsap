import { Globe, GlobeLock } from 'lucide-react';
import { StatusPillBadge } from '@/components/custom/status-pill-badge';
import { formatWebVisibility } from '@/types/table-status-columns';

export type WebVisibilityBadgeProps = {
    visible: boolean;
    className?: string;
};

export function WebVisibilityBadge({
    visible,
    className,
}: WebVisibilityBadgeProps) {
    if (visible) {
        return (
            <StatusPillBadge
                icon={Globe}
                tone="positive"
                className={className}
            >
                {formatWebVisibility(true)}
            </StatusPillBadge>
        );
    }

    return (
        <StatusPillBadge
            icon={GlobeLock}
            tone="neutral"
            className={className}
        >
            {formatWebVisibility(false)}
        </StatusPillBadge>
    );
}
