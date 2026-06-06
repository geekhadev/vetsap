import { IdCard } from 'lucide-react';
import { StatusPillBadge } from '@/components/custom/status-pill-badge';
import type { PatientRecordBadgeProps } from './types';

export type { PatientRecordBadgeProps } from './types';

export function PatientRecordBadge({
    recordNumber,
    className,
}: PatientRecordBadgeProps) {
    const value = recordNumber?.trim() ?? '';

    if (value === '') {
        return <span className="text-muted-foreground">—</span>;
    }

    return (
        <StatusPillBadge icon={IdCard} tone="neutral" className={className}>
            {value}
        </StatusPillBadge>
    );
}
