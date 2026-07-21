import { Head, router } from '@inertiajs/react';
import {
    CircleCheck,
    CircleDot,
    CircleMinus,
    Eye,
    GitMerge,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { CurrencyDisplay } from '@/components/custom/currency-display';
import { DateDisplay } from '@/components/custom/date-display';
import { SaleDocumentBadge } from '@/components/custom/sale-document-badge';
import { SaleDocumentPreviewDialog } from '@/components/custom/sale-document-preview';
import { StatusPillBadge } from '@/components/custom/status-pill-badge';
import type { StatusPillTone } from '@/components/custom/status-pill-badge';
import {
    pickTabledataListShellConfig,
    TABLEDATA_LIST_INERTIA_ONLY,
    TabledataProvider,
} from '@/components/custom/tabledata';
import type { TabledataColumn } from '@/components/custom/tabledata';
import { Button } from '@/components/ui/button';
import { CONFIG_TABLEDATA } from '@/pages/sale/sale-documents/config';
import { SaleDocumentsIndexFilters } from '@/pages/sale/sale-documents/filters';
import type {
    SaleDocument,
    SaleDocumentListFilters,
    SaleDocumentsIndexFiltersDraftFull,
    SaleDocumentStatus,
} from '@/pages/sale/sale-documents/types';
import { SALE_DOCUMENT_STATUS_LABEL } from '@/pages/sale/sale-documents/types';

const STATUS_BADGE: Record<
    SaleDocumentStatus,
    { tone: StatusPillTone; icon: typeof CircleCheck }
> = {
    draft: { tone: 'neutral', icon: CircleDot },
    issued: { tone: 'neutral', icon: CircleDot },
    paid: { tone: 'positive', icon: CircleCheck },
    voided: { tone: 'negative', icon: CircleMinus },
    merged: { tone: 'neutral', icon: GitMerge },
};

function SaleDocumentsIndex() {
    const [previewDocumentId, setPreviewDocumentId] = useState<string | null>(
        null,
    );

    const columns = useMemo<TabledataColumn<SaleDocument>[]>(
        () => [
            {
                key: 'document_number',
                label: 'Documento',
                sortable: true,
                hideable: false,
                render: (row) => (
                    <SaleDocumentBadge
                        abbreviation={row.sii_tax_document_type?.abbreviation}
                        documentNumber={row.document_number}
                        title="Vista previa del documento"
                        onClick={() => setPreviewDocumentId(row.id)}
                    />
                ),
            },
            {
                key: 'created_at',
                label: 'Fecha',
                sortable: true,
                render: (row) => (
                    <DateDisplay
                        value={row.issued_at ?? row.created_at}
                        mode="datetime"
                    />
                ),
            },
            {
                key: 'customer_name',
                label: 'Cliente',
                sortable: false,
                render: (row) => row.customer_name,
            },
            {
                key: 'status',
                label: 'Estado',
                sortable: true,
                render: (row) => {
                    const badge = STATUS_BADGE[row.status];

                    return (
                        <StatusPillBadge icon={badge.icon} tone={badge.tone}>
                            {SALE_DOCUMENT_STATUS_LABEL[row.status]}
                        </StatusPillBadge>
                    );
                },
            },
            {
                key: 'net_amount',
                label: 'Neto',
                sortable: false,
                render: (row) => <CurrencyDisplay value={row.net_amount} />,
            },
            {
                key: 'exempt_amount',
                label: 'Exento',
                sortable: false,
                render: (row) => <CurrencyDisplay value={row.exempt_amount} />,
            },
            {
                key: 'tax_amount',
                label: 'IVA',
                sortable: false,
                render: (row) => <CurrencyDisplay value={row.tax_amount} />,
            },
            {
                key: 'total_amount',
                label: 'Total',
                sortable: true,
                render: (row) => <CurrencyDisplay value={row.total_amount} />,
            },
            {
                key: 'actions',
                label: '',
                sortable: false,
                hideable: false,
                headerClassName: 'w-0 text-right',
                render: (row) => (
                    <div className="flex justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            title="Vista previa"
                            onClick={() => setPreviewDocumentId(row.id)}
                        >
                            <Eye className="size-3" />
                            <span className="sr-only">Vista previa</span>
                        </Button>
                    </div>
                ),
            },
        ],
        [],
    );

    return (
        <>
            <Head title={CONFIG_TABLEDATA.pageTitle} />

            <TabledataProvider<
                SaleDocument,
                SaleDocumentListFilters,
                SaleDocumentsIndexFiltersDraftFull
            >
                listConfig={pickTabledataListShellConfig(CONFIG_TABLEDATA)}
                listInertia={CONFIG_TABLEDATA.listInertia}
                columns={columns}
                toolbar={(list) => (
                    <SaleDocumentsIndexFilters
                        filters={list.filters}
                        setFilter={list.setFilter}
                        applyFilters={list.applyFilters}
                        resetFilters={list.resetFilters}
                    />
                )}
                emptyMessage="Ningún documento de venta coincide con la búsqueda o los filtros."
                getRowKey={(row) => row.id}
                density="compact"
            />

            <SaleDocumentPreviewDialog
                open={previewDocumentId !== null}
                saleDocumentId={previewDocumentId}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen) {
                        setPreviewDocumentId(null);
                    }
                }}
                onDeleted={() => {
                    router.reload({
                        only: [...TABLEDATA_LIST_INERTIA_ONLY],
                        preserveScroll: true,
                    });
                }}
            />
        </>
    );
}

SaleDocumentsIndex.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.index(),
};

export default SaleDocumentsIndex;
