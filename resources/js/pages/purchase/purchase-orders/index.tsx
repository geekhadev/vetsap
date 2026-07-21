import { Head, usePage } from '@inertiajs/react';
import { CirclePlus, PencilIcon, TrashIcon } from 'lucide-react';
import { useMemo } from 'react';
import { AppointmentStatusColorBadge } from '@/components/custom/appointment-status-color-badge';
import { CurrencyDisplay } from '@/components/custom/currency-display';
import { DateDisplay } from '@/components/custom/date-display';
import {
    pickTabledataListShellConfig,
    TabledataProvider,
} from '@/components/custom/tabledata';
import type { TabledataColumn } from '@/components/custom/tabledata';
import { Button } from '@/components/ui/button';
import { useEntityFormDialogState } from '@/hooks/use-entity-form-dialog-state';
import { isAppointmentStatusColorValue } from '@/lib/appointment-status-colors';
import { CONFIG_TABLEDATA } from '@/pages/purchase/purchase-orders/config';
import type { PurchaseOrdersIndexPageProps } from '@/pages/purchase/purchase-orders/config';
import { PurchaseOrdersIndexFilters } from '@/pages/purchase/purchase-orders/filters';
import { PurchaseOrderForm } from '@/pages/purchase/purchase-orders/form';
import { usePurchaseOrdersIndex } from '@/pages/purchase/purchase-orders/hooks/use-index';
import type {
    PurchaseOrder,
    PurchaseOrderListFilters,
    PurchaseOrdersIndexFiltersDraftFull,
} from '@/pages/purchase/purchase-orders/types';

function PurchaseOrdersIndex() {
    const { can, suppliers, purchaseOrderStatuses } =
        usePage<PurchaseOrdersIndexPageProps>().props;
    const { deleteRow, deleteConfirmDialog } = usePurchaseOrdersIndex();
    const { formOpen, editingEntity, openCreate, openEdit, handleFormOpenChange } =
        useEntityFormDialogState<PurchaseOrder>();

    const columns = useMemo<TabledataColumn<PurchaseOrder>[]>(
        () => [
            {
                key: 'ordered_at',
                label: 'Fecha',
                sortable: true,
                hideable: false,
                render: (row) => (
                    <DateDisplay value={row.ordered_at} mode="date" />
                ),
            },
            {
                key: 'supplier',
                label: 'Proveedor',
                sortable: false,
                render: (row) => row.supplier?.name ?? '—',
            },
            {
                key: 'purchase_order_status',
                label: 'Estado',
                sortable: false,
                render: (row) => {
                    const status = row.purchase_order_status;

                    if (!status) {
                        return '—';
                    }

                    return isAppointmentStatusColorValue(status.color) ? (
                        <AppointmentStatusColorBadge
                            color={status.color}
                            label={status.name}
                        />
                    ) : (
                        status.name
                    );
                },
            },
            {
                key: 'total',
                label: 'Total',
                sortable: true,
                render: (row) => <CurrencyDisplay value={row.total} />,
            },
            {
                key: 'user',
                label: 'Usuario',
                sortable: false,
                render: (row) => row.user?.name ?? '—',
            },
            {
                key: 'actions',
                label: '',
                sortable: false,
                hideable: false,
                headerClassName: 'w-0 text-right',
                render: (row) => (
                    <div className="flex justify-end gap-1">
                        {can.update ? (
                            <Button
                                variant="outline"
                                size="icon"
                                type="button"
                                title="Editar orden"
                                onClick={() => openEdit(row)}
                            >
                                <PencilIcon className="size-3" />
                            </Button>
                        ) : null}
                        {can.delete ? (
                            <Button
                                variant="destructive"
                                size="icon"
                                className="p-0.5"
                                type="button"
                                title="Eliminar"
                                onClick={() => deleteRow(row)}
                            >
                                <TrashIcon className="size-3" />
                            </Button>
                        ) : null}
                    </div>
                ),
            },
        ],
        [can.delete, can.update, deleteRow, openEdit],
    );

    return (
        <>
            {deleteConfirmDialog}
            <Head title={CONFIG_TABLEDATA.pageTitle} />

            <PurchaseOrderForm
                open={formOpen}
                onOpenChange={handleFormOpenChange}
                entity={editingEntity}
                suppliers={suppliers}
                purchaseOrderStatuses={purchaseOrderStatuses}
            />

            <TabledataProvider<
                PurchaseOrder,
                PurchaseOrderListFilters,
                PurchaseOrdersIndexFiltersDraftFull
            >
                listConfig={pickTabledataListShellConfig(CONFIG_TABLEDATA)}
                listInertia={CONFIG_TABLEDATA.listInertia}
                columns={columns}
                toolbar={(list) => (
                    <>
                        <PurchaseOrdersIndexFilters
                            filters={list.filters}
                            setFilter={list.setFilter}
                            applyFilters={list.applyFilters}
                            resetFilters={list.resetFilters}
                            suppliers={suppliers}
                            purchaseOrderStatuses={purchaseOrderStatuses}
                        />
                        {can.create ? (
                            <Button type="button" onClick={openCreate}>
                                <CirclePlus />
                                Nuevo
                            </Button>
                        ) : null}
                    </>
                )}
                emptyMessage="Ninguna orden de compra coincide con la búsqueda o los filtros."
                getRowKey={(row) => row.id}
                density="compact"
            />
        </>
    );
}

PurchaseOrdersIndex.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.index(),
};

export default PurchaseOrdersIndex;
