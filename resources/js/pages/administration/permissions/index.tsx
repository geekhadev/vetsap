import { Head, usePage } from '@inertiajs/react';
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
import type { PermissionsIndexPageProps } from '@/pages/administration/permissions/config';
import { CONFIG_TABLEDATA } from '@/pages/administration/permissions/config';
import { PermissionsIndexFilters } from '@/pages/administration/permissions/filters';
import { FormDialog } from '@/pages/administration/permissions/form-dialog';
import { usePermissionsIndex } from '@/pages/administration/permissions/hooks/use-index';
import type {
    Permission,
    PermissionListFilters,
    PermissionsIndexFiltersDraftFull,
} from './types';

function PermissionsIndex() {
    const { systems, modules } = usePage<PermissionsIndexPageProps>().props;
    const { deleteRow, deleteConfirmDialog } = usePermissionsIndex();
    const { formOpen, editingEntity, openCreate, openEdit, handleFormOpenChange } =
        useEntityFormDialogState<Permission>();

    const columns = useMemo<TabledataColumn<Permission>[]>(
        () => [
            {
                key: 'name',
                label: 'Nombre',
                sortable: true,
                hideable: false,
            },
            {
                key: 'module',
                label: 'Módulo',
                sortable: false,
                hideable: false,
                render: (row) => row.module?.name ?? '—',
            },
            {
                key: 'system',
                label: 'Sistema',
                sortable: false,
                hideable: false,
                render: (row) => row.module?.system?.name ?? '—',
            },
            {
                key: 'slug',
                label: 'Slug',
                sortable: true,
                hideable: false,
            },
            buildTabledataCrudActionsColumn<Permission>({
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
                permission={editingEntity}
                systems={systems}
                modules={modules}
            />

            <TabledataProvider<
                Permission,
                PermissionListFilters,
                PermissionsIndexFiltersDraftFull
            >
                listConfig={pickTabledataListShellConfig(CONFIG_TABLEDATA)}
                listInertia={CONFIG_TABLEDATA.listInertia}
                columns={columns}
                toolbar={(list) => (
                    <>
                        <PermissionsIndexFilters
                            filters={list.filters}
                            setFilter={list.setFilter}
                            applyFilters={list.applyFilters}
                            resetFilters={list.resetFilters}
                            systems={systems}
                            modules={modules}
                        />
                        <Button type="button" onClick={openCreate}>
                            <CirclePlus />
                            Nuevo
                        </Button>
                    </>
                )}
                emptyMessage="Ningún permiso coincide con la búsqueda o los filtros."
                getRowKey={(row) => row.id}
                density="compact"
            />
        </>
    );
}

PermissionsIndex.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.index(),
};

export default PermissionsIndex;
