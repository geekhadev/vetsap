import { Head } from '@inertiajs/react';
import { CirclePlus, PencilIcon, TrashIcon } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import {
    pickTabledataListShellConfig,
    TabledataProvider,
} from '@/components/custom/tabledata';
import type { TabledataColumn } from '@/components/custom/tabledata';
import { Button } from '@/components/ui/button';
import {
    CONFIG_TABLEDATA
    
} from '@/pages/sale/customers/config';
import type {CustomersIndexPageProps} from '@/pages/sale/customers/config';
import { CustomersIndexFilters } from '@/pages/sale/customers/filters';
import { CustomerForm } from '@/pages/sale/customers/form';
import { useCustomersIndex } from '@/pages/sale/customers/hooks/use-index';
import {
    formatDocumentType
    
    
    
} from '@/pages/sale/customers/types';
import type {Customer, CustomerListFilters, CustomersIndexFiltersDraftFull} from '@/pages/sale/customers/types';

function CustomersIndex({ can }: Pick<CustomersIndexPageProps, 'can'>) {
    const { deleteRow } = useCustomersIndex();
    const [formOpen, setFormOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

    const openCreate = useCallback(() => {
        setEditingCustomer(null);
        setFormOpen(true);
    }, []);

    const openEdit = useCallback((row: Customer) => {
        setEditingCustomer(row);
        setFormOpen(true);
    }, []);

    const handleFormOpenChange = useCallback((open: boolean) => {
        setFormOpen(open);

        if (!open) {
            setEditingCustomer(null);
        }
    }, []);

    const columns = useMemo<TabledataColumn<Customer>[]>(
        () => [
            {
                key: 'name',
                label: 'Nombre',
                sortable: true,
                hideable: false,
            },
            {
                key: 'document_type',
                label: 'Tipo doc.',
                sortable: true,
                render: (row) => formatDocumentType(row.document_type),
            },
            {
                key: 'document_number',
                label: 'Documento',
                sortable: true,
                render: (row) => row.document_number,
            },
            {
                key: 'email',
                label: 'Email',
                sortable: true,
                render: (row) => row.email ?? '—',
            },
            {
                key: 'phone',
                label: 'Teléfono',
                sortable: false,
                render: (row) => row.phone ?? '—',
            },
            {
                key: 'actions',
                label: 'Acciones',
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
            <Head title={CONFIG_TABLEDATA.pageTitle} />

            <CustomerForm
                open={formOpen}
                onOpenChange={handleFormOpenChange}
                entity={editingCustomer}
            />

            <TabledataProvider<Customer, CustomerListFilters, CustomersIndexFiltersDraftFull>
                listConfig={pickTabledataListShellConfig(CONFIG_TABLEDATA)}
                listInertia={CONFIG_TABLEDATA.listInertia}
                columns={columns}
                toolbar={(list) => (
                    <>
                        <CustomersIndexFilters
                            filters={list.filters}
                            setFilter={list.setFilter}
                            applyFilters={list.applyFilters}
                            resetFilters={list.resetFilters}
                        />
                        {can.create ? (
                            <Button type="button" onClick={openCreate}>
                                <CirclePlus />
                                Nuevo
                            </Button>
                        ) : null}
                    </>
                )}
                emptyMessage="Ningún cliente coincide con la búsqueda o los filtros."
                getRowKey={(row) => row.id}
                density="compact"
            />
        </>
    );
}

CustomersIndex.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.index(),
};

export default CustomersIndex;
