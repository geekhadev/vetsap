import { Head, usePage } from '@inertiajs/react';
import { CirclePlus, PencilIcon, TrashIcon } from 'lucide-react';
import { useMemo } from 'react';
import { DocumentBadge } from '@/components/custom/document-badge';
import {
    pickTabledataListShellConfig,
    TabledataProvider,
} from '@/components/custom/tabledata';
import type { TabledataColumn } from '@/components/custom/tabledata';
import { Button } from '@/components/ui/button';
import { useEntityFormDialogState } from '@/hooks/use-entity-form-dialog-state';
import {
    CONFIG_TABLEDATA,
} from '@/pages/purchase/suppliers/config';
import type { SuppliersIndexPageProps } from '@/pages/purchase/suppliers/config';
import { SuppliersIndexFilters } from '@/pages/purchase/suppliers/filters';
import { SupplierForm } from '@/pages/purchase/suppliers/form';
import { useSuppliersIndex } from '@/pages/purchase/suppliers/hooks/use-index';
import type {
    Supplier,
    SupplierListFilters,
    SuppliersIndexFiltersDraftFull,
} from '@/pages/purchase/suppliers/types';

function SuppliersIndex() {
    const { can } = usePage<SuppliersIndexPageProps>().props;
    const { deleteRow, deleteConfirmDialog } = useSuppliersIndex();
    const { formOpen, editingEntity, openCreate, openEdit, handleFormOpenChange } =
        useEntityFormDialogState<Supplier>();

    const columns = useMemo<TabledataColumn<Supplier>[]>(
        () => [
            {
                key: 'name',
                label: 'Nombre',
                sortable: true,
                hideable: false,
            },
            {
                key: 'document_number',
                label: 'Documento',
                sortable: true,
                render: (row) => (
                    <DocumentBadge
                        documentType={row.document_type}
                        documentNumber={row.document_number}
                    />
                ),
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
                                title="Editar proveedor"
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

            <SupplierForm
                open={formOpen}
                onOpenChange={handleFormOpenChange}
                entity={editingEntity}
            />

            <TabledataProvider<Supplier, SupplierListFilters, SuppliersIndexFiltersDraftFull>
                listConfig={pickTabledataListShellConfig(CONFIG_TABLEDATA)}
                listInertia={CONFIG_TABLEDATA.listInertia}
                columns={columns}
                toolbar={(list) => (
                    <>
                        <SuppliersIndexFilters
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
                emptyMessage="Ningún proveedor coincide con la búsqueda o los filtros."
                getRowKey={(row) => row.id}
                density="compact"
            />
        </>
    );
}

SuppliersIndex.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.index(),
};

export default SuppliersIndex;
