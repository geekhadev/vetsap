import { Head } from '@inertiajs/react';
import { CirclePlus, PencilIcon, TrashIcon } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import {
    pickTabledataListShellConfig,
    TabledataProvider,
} from '@/components/custom/tabledata';
import type { TabledataColumn } from '@/components/custom/tabledata';
import { Button } from '@/components/ui/button';
import { CONFIG_TABLEDATA } from '@/pages/shared/payment-methods/config';
import { FormDialog } from '@/pages/shared/payment-methods/form-dialog';
import { usePaymentMethodsIndex } from '@/pages/shared/payment-methods/hooks/use-index';
import type {
    PaymentMethod,
    PaymentMethodListFilters,
    PaymentMethodsIndexFiltersDraftFull,
} from './types';

function PaymentMethodsIndex() {
    const { deleteRow } = usePaymentMethodsIndex();
    const [formOpen, setFormOpen] = useState(false);
    const [editingPaymentMethod, setEditingPaymentMethod] =
        useState<PaymentMethod | null>(null);

    const openCreate = useCallback(() => {
        setEditingPaymentMethod(null);
        setFormOpen(true);
    }, []);

    const openEdit = useCallback((row: PaymentMethod) => {
        setEditingPaymentMethod(row);
        setFormOpen(true);
    }, []);

    const handleFormOpenChange = useCallback((open: boolean) => {
        setFormOpen(open);

        if (!open) {
            setEditingPaymentMethod(null);
        }
    }, []);

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
            {
                key: 'actions',
                label: 'Acciones',
                hideable: false,
                headerClassName: 'w-0 text-right',
                render: (row) => (
                    <div className="flex justify-end gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            type="button"
                            onClick={() => openEdit(row)}
                        >
                            <PencilIcon className="size-3" />
                        </Button>
                        <Button
                            variant="destructive"
                            size="icon"
                            className="p-0.5"
                            type="button"
                            onClick={() => deleteRow(row)}
                        >
                            <TrashIcon className="size-3" />
                        </Button>
                    </div>
                ),
            },
        ],
        [deleteRow, openEdit],
    );

    return (
        <>
            <Head title={CONFIG_TABLEDATA.pageTitle} />

            <FormDialog
                open={formOpen}
                onOpenChange={handleFormOpenChange}
                paymentMethod={editingPaymentMethod}
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
