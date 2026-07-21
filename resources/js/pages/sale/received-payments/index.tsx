import { Head, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { CurrencyDisplay } from '@/components/custom/currency-display';
import { DateDisplay } from '@/components/custom/date-display';
import { SaleDocumentBadge } from '@/components/custom/sale-document-badge';
import { SaleDocumentPreviewDialog } from '@/components/custom/sale-document-preview';
import {
    pickTabledataListShellConfig,
    TabledataProvider,
} from '@/components/custom/tabledata';
import type { TabledataColumn } from '@/components/custom/tabledata';
import { CONFIG_TABLEDATA } from '@/pages/sale/received-payments/config';
import type { ReceivedPaymentsIndexPageProps } from '@/pages/sale/received-payments/config';
import { ReceivedPaymentsIndexFilters } from '@/pages/sale/received-payments/filters';
import type {
    ReceivedPayment,
    ReceivedPaymentListFilters,
    ReceivedPaymentsIndexFiltersDraftFull,
} from '@/pages/sale/received-payments/types';

function ReceivedPaymentsIndex() {
    const { paymentMethods } = usePage<ReceivedPaymentsIndexPageProps>().props;
    const [previewDocumentId, setPreviewDocumentId] = useState<string | null>(
        null,
    );

    const columns = useMemo<TabledataColumn<ReceivedPayment>[]>(
        () => [
            {
                key: 'paid_at',
                label: 'Fecha',
                sortable: true,
                hideable: false,
                render: (row) => (
                    <DateDisplay value={row.paid_at} mode="datetime" />
                ),
            },
            {
                key: 'customer',
                label: 'Cliente',
                sortable: false,
                render: (row) => row.sale_document?.customer_name ?? '—',
            },
            {
                key: 'document',
                label: 'Documento',
                sortable: false,
                render: (row) => {
                    const document = row.sale_document;

                    if (!document) {
                        return '—';
                    }

                    return (
                        <SaleDocumentBadge
                            abbreviation={
                                document.sii_tax_document_type?.abbreviation
                            }
                            documentNumber={document.document_number}
                            title="Vista previa del documento"
                            onClick={() => setPreviewDocumentId(document.id)}
                        />
                    );
                },
            },
            {
                key: 'payment_method',
                label: 'Método',
                sortable: false,
                render: (row) => row.payment_method?.name ?? '—',
            },
            {
                key: 'amount',
                label: 'Monto',
                sortable: true,
                render: (row) => <CurrencyDisplay value={row.amount} />,
            },
            {
                key: 'created_by',
                label: 'Usuario',
                sortable: false,
                render: (row) => row.created_by?.name ?? '—',
            },
        ],
        [],
    );

    return (
        <>
            <Head title={CONFIG_TABLEDATA.pageTitle} />

            <TabledataProvider<
                ReceivedPayment,
                ReceivedPaymentListFilters,
                ReceivedPaymentsIndexFiltersDraftFull
            >
                listConfig={pickTabledataListShellConfig(CONFIG_TABLEDATA)}
                listInertia={CONFIG_TABLEDATA.listInertia}
                columns={columns}
                toolbar={(list) => (
                    <ReceivedPaymentsIndexFilters
                        filters={list.filters}
                        setFilter={list.setFilter}
                        applyFilters={list.applyFilters}
                        resetFilters={list.resetFilters}
                        paymentMethods={paymentMethods}
                    />
                )}
                emptyMessage="Ningún pago recibido coincide con la búsqueda o los filtros."
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
            />
        </>
    );
}

ReceivedPaymentsIndex.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.index(),
};

export default ReceivedPaymentsIndex;
