import { Badge } from '@/components/ui/badge';
import type { SiiTaxDocumentType } from '@/pages/shared/sii-tax-document-types/types';

export function UsageBadges({ row }: { row: SiiTaxDocumentType }) {
    return (
        <div className="flex flex-wrap gap-1">
            {row.use_sale ? (
                <Badge variant="default">Venta</Badge>
            ) : null}
            {row.use_purchase ? (
                <Badge variant="secondary">Compra</Badge>
            ) : null}
            {!row.use_sale && !row.use_purchase ? (
                <span className="text-muted-foreground text-xs">—</span>
            ) : null}
        </div>
    );
}
