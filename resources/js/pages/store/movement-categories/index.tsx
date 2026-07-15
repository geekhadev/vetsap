import { Head, usePage } from '@inertiajs/react';
import { CirclePlus } from 'lucide-react';
import { useMemo } from 'react';
import {
    pickTabledataListShellConfig,
    TabledataProvider,
} from '@/components/custom/tabledata';
import type { TabledataColumn } from '@/components/custom/tabledata';
import {
    buildTabledataCrudActionsColumn,
    buildTabledataIsActiveStatusColumn,
} from '@/components/custom/tabledata-crud-actions';
import { Button } from '@/components/ui/button';
import { useEntityFormDialogState } from '@/hooks/use-entity-form-dialog-state';
import {
    canDeleteStoreMasterRow,
    canModifyStoreMasterRow,
} from '@/lib/store-master-record';
import { CONFIG_TABLEDATA } from '@/pages/store/movement-categories/config';
import type { MovementCategoriesIndexPageProps } from '@/pages/store/movement-categories/config';
import { MovementCategoriesIndexFilters } from '@/pages/store/movement-categories/filters';
import { MovementCategoryForm } from '@/pages/store/movement-categories/form';
import { useMovementCategoriesIndex } from '@/pages/store/movement-categories/hooks/use-index';
import type {
    MovementCategory,
    MovementCategoryListFilters,
    MovementCategoriesIndexFiltersDraftFull,
} from '@/pages/store/movement-categories/types';
import { formatMovementType } from '@/pages/store/movement-categories/types';

function MovementCategoriesIndex() {
    const { can, movementTypes } =
        usePage<MovementCategoriesIndexPageProps>().props;
    const { deleteRow, deleteConfirmDialog } = useMovementCategoriesIndex();
    const { formOpen, editingEntity, openCreate, openEdit, handleFormOpenChange } =
        useEntityFormDialogState<MovementCategory>();

    const columns = useMemo<TabledataColumn<MovementCategory>[]>(
        () => [
            {
                key: 'name',
                label: 'Nombre',
                sortable: true,
                hideable: false,
            },
            {
                key: 'type',
                label: 'Tipo',
                sortable: true,
                render: (row) => formatMovementType(row.type, movementTypes),
            },
            buildTabledataIsActiveStatusColumn<MovementCategory>(),
            buildTabledataCrudActionsColumn<MovementCategory>({
                onEdit: openEdit,
                onDelete: deleteRow,
                canModifyRow: (row) => canModifyStoreMasterRow(row, can),
                canDeleteRow: (row) => canDeleteStoreMasterRow(row, can),
            }),
        ],
        [can, deleteRow, movementTypes, openEdit],
    );

    return (
        <>
            {deleteConfirmDialog}
            <Head title={CONFIG_TABLEDATA.pageTitle} />

            <MovementCategoryForm
                open={formOpen}
                onOpenChange={handleFormOpenChange}
                entity={editingEntity}
                movementTypes={movementTypes}
            />

            <TabledataProvider<
                MovementCategory,
                MovementCategoryListFilters,
                MovementCategoriesIndexFiltersDraftFull
            >
                listConfig={pickTabledataListShellConfig(CONFIG_TABLEDATA)}
                listInertia={CONFIG_TABLEDATA.listInertia}
                columns={columns}
                toolbar={(list) => (
                    <>
                        <MovementCategoriesIndexFilters
                            filters={list.filters}
                            setFilter={list.setFilter}
                            applyFilters={list.applyFilters}
                            resetFilters={list.resetFilters}
                            movementTypes={movementTypes}
                        />
                        {can.create ? (
                            <Button type="button" onClick={openCreate}>
                                <CirclePlus />
                                Nuevo
                            </Button>
                        ) : null}
                    </>
                )}
                emptyMessage="Ninguna categoría coincide con la búsqueda o los filtros."
                getRowKey={(row) => row.id}
                density="compact"
            />
        </>
    );
}

MovementCategoriesIndex.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.index(),
};

export default MovementCategoriesIndex;
