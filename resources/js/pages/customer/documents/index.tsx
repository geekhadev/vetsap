import { Head } from '@inertiajs/react';
import {
    CircleCheck,
    CircleDot,
    CircleMinus,
    FileText,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { CurrencyDisplay } from '@/components/custom/currency-display';
import { DateDisplay } from '@/components/custom/date-display';
import { SaleDocumentBadge } from '@/components/custom/sale-document-badge';
import { SaleDocumentPreviewDialog } from '@/components/custom/sale-document-preview';
import { StatusPillBadge } from '@/components/custom/status-pill-badge';
import type { StatusPillTone } from '@/components/custom/status-pill-badge';
import { buildAppRootBreadcrumbs } from '@/lib/module-breadcrumbs';
import { cn } from '@/lib/utils';
import type {
    CustomerDocumentsIndexPageProps,
    CustomerSaleDocument,
} from '@/pages/customer/documents/types';
import {
    SALE_DOCUMENT_PAYMENT_STATUS_LABEL,
    SALE_DOCUMENT_STATUS_LABEL,
} from '@/pages/sale/sale-documents/types';
import type { SaleDocumentPaymentStatus } from '@/pages/sale/sale-documents/types';
import {
    index as documentsIndex,
    show as documentsShow,
} from '@/routes/customer/documents';
import { index as petsIndex } from '@/routes/customer/pets';

const PAYMENT_STATUS_BADGE: Record<
    SaleDocumentPaymentStatus,
    { tone: StatusPillTone; icon: typeof CircleCheck }
> = {
    pending: { tone: 'danger', icon: CircleDot },
    partial: { tone: 'warning', icon: CircleDot },
    paid: { tone: 'positive', icon: CircleCheck },
};

export default function CustomerDocumentsIndex({
    documents,
}: CustomerDocumentsIndexPageProps) {
    const [previewDocumentId, setPreviewDocumentId] = useState<string | null>(
        null,
    );

    const resolvePreviewUrl = useCallback(
        (saleDocumentId: string) => documentsShow.url(saleDocumentId),
        [],
    );

    return (
        <>
            <Head title="Mis documentos" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">
                        Mis documentos
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Documentos de venta emitidos a tu nombre.
                    </p>
                </div>

                {documents.length === 0 ? (
                    <div className="border-border bg-muted/30 flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-10 text-center">
                        <FileText
                            className="text-muted-foreground size-10"
                            aria-hidden
                        />
                        <div className="space-y-1">
                            <p className="font-medium">Sin documentos aún</p>
                            <p className="text-muted-foreground text-sm">
                                Cuando la clínica emita boletas o facturas a tu
                                nombre, aparecerán aquí.
                            </p>
                        </div>
                    </div>
                ) : (
                    <ul className="mx-auto grid w-full max-w-3xl gap-3">
                        {documents.map((document) => (
                            <li key={document.id}>
                                <DocumentCard
                                    document={document}
                                    onPreview={() =>
                                        setPreviewDocumentId(document.id)
                                    }
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <SaleDocumentPreviewDialog
                open={previewDocumentId !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setPreviewDocumentId(null);
                    }
                }}
                saleDocumentId={previewDocumentId}
                previewUrl={resolvePreviewUrl}
            />
        </>
    );
}

function DocumentCard({
    document,
    onPreview,
}: {
    document: CustomerSaleDocument;
    onPreview: () => void;
}) {
    const paymentBadge = PAYMENT_STATUS_BADGE[document.payment_status];
    const isVoided = document.status === 'voided';
    const label = [
        document.sii_tax_document_type?.abbreviation?.trim() || 'Doc',
        document.document_number?.trim() || '—',
    ].join(' ');

    return (
        <button
            type="button"
            onClick={onPreview}
            aria-label={`Ver documento ${label}`}
            className={cn(
                'bg-card hover:bg-accent/40 focus-visible:ring-ring flex w-full flex-col gap-3 rounded-xl border p-4 text-left shadow-xs transition-colors',
                'focus-visible:ring-2 focus-visible:outline-hidden',
            )}
        >
            <SaleDocumentBadge
                abbreviation={document.sii_tax_document_type?.abbreviation}
                documentNumber={document.document_number}
            />

            <div className="flex flex-wrap items-center gap-2">
                <StatusPillBadge
                    tone={isVoided ? 'negative' : 'neutral'}
                    icon={isVoided ? CircleMinus : CircleDot}
                >
                    {SALE_DOCUMENT_STATUS_LABEL[document.status]}
                </StatusPillBadge>
                <StatusPillBadge
                    tone={paymentBadge.tone}
                    icon={paymentBadge.icon}
                >
                    {SALE_DOCUMENT_PAYMENT_STATUS_LABEL[document.payment_status]}
                </StatusPillBadge>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="text-muted-foreground text-sm">
                    <DateDisplay
                        value={document.issued_at ?? document.created_at}
                        mode="datetime"
                    />
                    {document.sii_tax_document_type?.name ? (
                        <p className="mt-0.5 text-xs">
                            {document.sii_tax_document_type.name}
                        </p>
                    ) : null}
                </div>
                <p className="text-base font-semibold">
                    <CurrencyDisplay value={document.total_amount} />
                </p>
            </div>
        </button>
    );
}

CustomerDocumentsIndex.layout = {
    breadcrumbs: [
        ...buildAppRootBreadcrumbs(petsIndex()),
        { title: 'Mis documentos', href: documentsIndex() },
    ],
};
