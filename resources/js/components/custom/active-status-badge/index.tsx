import { CircleCheck, CircleOff } from 'lucide-react';
import { StatusPillBadge } from '@/components/custom/status-pill-badge';
import { formatIsActive } from '@/types/active-record';
import type { ActiveRecordGender } from '@/types/active-record';

export type ActiveStatusBadgeProps = {
    active: boolean;
    gender?: ActiveRecordGender;
    className?: string;
};

export function ActiveStatusBadge({
    active,
    gender = 'm',
    className,
}: ActiveStatusBadgeProps) {
    const label = formatIsActive(active, gender);

    if (active) {
        return (
            <StatusPillBadge
                icon={CircleCheck}
                tone="positive"
                className={className}
            >
                {label}
            </StatusPillBadge>
        );
    }

    return (
        <StatusPillBadge icon={CircleOff} tone="neutral" className={className}>
            {label}
        </StatusPillBadge>
    );
}
