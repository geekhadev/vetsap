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
import {
    CONFIG_TABLEDATA,
} from '@/pages/sale/customers/config';
import type { CustomersIndexPageProps } from '@/pages/sale/customers/config';
import { CustomersIndexFilters } from '@/pages/sale/customers/filters';
import { CustomerForm } from '@/pages/sale/customers/form';
import { useCustomersIndex } from '@/pages/sale/customers/hooks/use-index';
import { formatDocumentType } from '@/pages/sale/customers/types';
import type {
    Customer,
    CustomerListFilters,
    CustomersIndexFiltersDraftFull,
} from '@/pages/sale/customers/types';

function CustomersIndex({ can }: Pick<CustomersIndexPageProps, 'can'>) {
    const { deleteRow } = useCustomersIndex();
    const { formOpen, editingEntity, openCreate, openEdit, handleFormOpenChange } =
        useEntityFormDialogState<Customer>();

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
            buildTabledataCrudActionsColumn<Customer>({
                can,
                onEdit: openEdit,
                onDelete: deleteRow,
            }),
        ],
        [can, deleteRow, openEdit],
    );

    return (
        <>
            <Head title={CONFIG_TABLEDATA.pageTitle} />

            <CustomerForm
                open={formOpen}
                onOpenChange={handleFormOpenChange}
                entity={editingEntity}
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
