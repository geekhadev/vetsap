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
import { CONFIG_TABLEDATA } from '@/pages/shared/payment-methods/config';
import { FormDialog } from '@/pages/shared/payment-methods/form-dialog';
import { usePaymentMethodsIndex } from '@/pages/shared/payment-methods/hooks/use-index';
import type {
    PaymentMethod,
    PaymentMethodListFilters,
    PaymentMethodsIndexFiltersDraftFull,
} from './types';

function PaymentMethodsIndex() {
    const { deleteRow, deleteConfirmDialog } = usePaymentMethodsIndex();
    const { formOpen, editingEntity, openCreate, openEdit, handleFormOpenChange } =
        useEntityFormDialogState<PaymentMethod>();

    const columns = useMemo<TabledataColumn<PaymentMethod>[]>(
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
                headerClassName: 'min-w-[100px]',
            },
            buildTabledataCrudActionsColumn<PaymentMethod>({
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
                paymentMethod={editingEntity}
            />

            <TabledataProvider<
                PaymentMethod,
                PaymentMethodListFilters,
                PaymentMethodsIndexFiltersDraftFull
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
                emptyMessage="Ningún método de pago coincide con la búsqueda."
                getRowKey={(row) => row.id}
                density="compact"
            />
        </>
    );
}

PaymentMethodsIndex.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.index(),
};

export default PaymentMethodsIndex;
