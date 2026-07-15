import { Head } from '@inertiajs/react';
import { CirclePlus } from 'lucide-react';
import { useMemo } from 'react';
import {
    pickTabledataListShellConfig,
    TabledataProvider,
} from '@/components/custom/tabledata';
import type { TabledataColumn } from '@/components/custom/tabledata';
import { buildTabledataCrudActionsColumn } from '@/components/custom/tabledata-crud-actions';
import { Button } from '@/components/ui/button';
import { useEntityFormDialogState } from '@/hooks/use-entity-form-dialog-state';
import { CONFIG_TABLEDATA } from '@/pages/shared/payment-types/config';
import { FormDialog } from '@/pages/shared/payment-types/form-dialog';
import { usePaymentTypesIndex } from '@/pages/shared/payment-types/hooks/use-index';
import type {
    PaymentType,
    PaymentTypeListFilters,
    PaymentTypesIndexFiltersDraftFull,
} from './types';

function PaymentTypesIndex() {
    const { deleteRow, deleteConfirmDialog } = usePaymentTypesIndex();
    const { formOpen, editingEntity, openCreate, openEdit, handleFormOpenChange } =
        useEntityFormDialogState<PaymentType>();

    const columns = useMemo<TabledataColumn<PaymentType>[]>(
        () => [
            {
                key: 'name',
                label: 'Nombre',
                sortable: true,
                hideable: false,
            },
            {
                key: 'code',
                label: 'Código',
                sortable: true,
                hideable: false,
            },
            buildTabledataCrudActionsColumn<PaymentType>({
                onEdit: openEdit,
                onDelete: deleteRow,
            }),
        ],
        [deleteRow, openEdit],
    );

    return (
        <>
            {deleteConfirmDialog}
            <Head title={CONFIG_TABLEDATA.pageTitle} />

            <FormDialog
                open={formOpen}
                onOpenChange={handleFormOpenChange}
                paymentType={editingEntity}
            />

            <TabledataProvider<
                PaymentType,
                PaymentTypeListFilters,
                PaymentTypesIndexFiltersDraftFull
            >
                listConfig={pickTabledataListShellConfig(CONFIG_TABLEDATA)}
                listInertia={CONFIG_TABLEDATA.listInertia}
                columns={columns}
                toolbar={
                    <Button type="button" onClick={openCreate}>
                        <CirclePlus />
                        Nuevo
                    </Button>
                }
                emptyMessage="Ningún tipo de pago coincide con la búsqueda."
                getRowKey={(row) => row.id}
                density="compact"
            />
        </>
    );
}

PaymentTypesIndex.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.index(),
};

export default PaymentTypesIndex;
