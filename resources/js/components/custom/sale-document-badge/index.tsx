import { FileText } from 'lucide-react';
import { StatusPillBadge } from '@/components/custom/status-pill-badge';
import { cn } from '@/lib/utils';
import type { SaleDocumentBadgeProps } from './types';

export type { SaleDocumentBadgeProps } from './types';

export function SaleDocumentBadge({
    abbreviation,
    documentNumber,
    onClick,
    title,
    className,
}: SaleDocumentBadgeProps) {
    const typeLabel = abbreviation?.trim() ?? '';
    const numberLabel = documentNumber?.trim() ?? '';

    if (typeLabel === '' && numberLabel === '') {
        return <span className="text-muted-foreground">—</span>;
    }

    const label = [typeLabel || 'Doc', numberLabel || '—'].join(' ');
    const isClickable = typeof onClick === 'function';

    const badge = (
        <StatusPillBadge
            icon={FileText}
            tone="neutral"
            className={cn(isClickable && 'cursor-pointer', className)}
        >
            {label}
        </StatusPillBadge>
    );

    if (!isClickable) {
        return badge;
    }

    return (
        <button
            type="button"
            className="inline-flex cursor-pointer border-0 bg-transparent p-0"
            title={title}
            onClick={onClick}
        >
            {badge}
        </button>
    );
}
