import { IdCard } from 'lucide-react';
import { StatusPillBadge } from '@/components/custom/status-pill-badge';
import { formatIdentityDocument } from '@/types/identity-document';
import type { DocumentBadgeProps } from './types';

export type { DocumentBadgeProps } from './types';

export function DocumentBadge({
    documentType,
    documentNumber,
    className,
}: DocumentBadgeProps) {
    return (
        <StatusPillBadge icon={IdCard} tone="neutral" className={className}>
            {formatIdentityDocument(documentType, documentNumber)}
        </StatusPillBadge>
    );
}
