import { Head } from '@inertiajs/react';
import { CirclePlus } from 'lucide-react';
import { useMemo } from 'react';
import { AppointmentStatusColorBadge } from '@/components/custom/appointment-status-color-badge';
import {
    pickTabledataListShellConfig,
    TabledataProvider,
} from '@/components/custom/tabledata';
import type { TabledataColumn } from '@/components/custom/tabledata';
import { buildTabledataCrudActionsColumn } from '@/components/custom/tabledata-crud-actions';
import { Button } from '@/components/ui/button';
import { useEntityFormDialogState } from '@/hooks/use-entity-form-dialog-state';
import { isAppointmentStatusColorValue } from '@/lib/appointment-status-colors';
import {
    canDeleteGlobalRecordRow,
    canModifyGlobalRecordRow,
} from '@/lib/global-record';
import { CONFIG_TABLEDATA } from '@/pages/purchase/purchase-order-statuses/config';
import type { PurchaseOrderStatusesIndexPageProps } from '@/pages/purchase/purchase-order-statuses/config';
import { PurchaseOrderStatusesForm } from '@/pages/purchase/purchase-order-statuses/form';
import { usePurchaseOrderStatusesIndex } from '@/pages/purchase/purchase-order-statuses/hooks/use-index';
import type {
    PurchaseOrderStatus,
    PurchaseOrderStatusesIndexFiltersDraftFull,
    PurchaseOrderStatusesListFilters,
} from '@/pages/purchase/purchase-order-statuses/types';

function PurchaseOrderStatusesIndex({
    can,
}: Pick<PurchaseOrderStatusesIndexPageProps, 'can'>) {
    const { deleteRow, deleteConfirmDialog } = usePurchaseOrderStatusesIndex();
    const { formOpen, editingEntity, openCreate, openEdit, handleFormOpenChange } =
        useEntityFormDialogState<PurchaseOrderStatus>();

    const columns = useMemo<TabledataColumn<PurchaseOrderStatus>[]>(
        () => [
            {
                key: 'name',
                label: 'Nombre',
                sortable: true,
                hideable: false,
            },
            {
                key: 'color',
                label: 'Color',
                sortable: true,
                hideable: false,
                render: (row) =>
                    isAppointmentStatusColorValue(row.color) ? (
                        <AppointmentStatusColorBadge
                            color={row.color}
                            label={row.name}
                        />
                    ) : (
                        row.color
                    ),
            },
            buildTabledataCrudActionsColumn<PurchaseOrderStatus>({
                can,
                onEdit: openEdit,
                onDelete: deleteRow,
                canModifyRow: (row) => canModifyGlobalRecordRow(row, can),
                canDeleteRow: (row) => canDeleteGlobalRecordRow(row, can),
            }),
        ],
        [can, deleteRow, openEdit],
    );

    return (
        <>
            {deleteConfirmDialog}
            <Head title={CONFIG_TABLEDATA.pageTitle} />

            <PurchaseOrderStatusesForm
                open={formOpen}
                onOpenChange={handleFormOpenChange}
                entity={editingEntity}
            />

            <TabledataProvider<
                PurchaseOrderStatus,
                PurchaseOrderStatusesListFilters,
                PurchaseOrderStatusesIndexFiltersDraftFull
            >
                listConfig={pickTabledataListShellConfig(CONFIG_TABLEDATA)}
                listInertia={CONFIG_TABLEDATA.listInertia}
                columns={columns}
                toolbar={() =>
                    can.create ? (
                        <Button type="button" onClick={openCreate}>
                            <CirclePlus />
                            Nuevo
                        </Button>
                    ) : null
                }
                emptyMessage="Ningún estado de orden de compra coincide con la búsqueda."
                getRowKey={(row) => row.id}
                density="compact"
            />
        </>
    );
}

PurchaseOrderStatusesIndex.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.index(),
};

export default PurchaseOrderStatusesIndex;
