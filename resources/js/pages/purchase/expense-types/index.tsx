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
    canDeleteGlobalRecordRow,
    canModifyGlobalRecordRow,
} from '@/lib/global-record';
import { CONFIG_TABLEDATA } from '@/pages/purchase/expense-types/config';
import type { ExpenseTypesIndexPageProps } from '@/pages/purchase/expense-types/config';
import { ExpenseTypesForm } from '@/pages/purchase/expense-types/form';
import { useExpenseTypesIndex } from '@/pages/purchase/expense-types/hooks/use-index';
import type {
    ExpenseType,
    ExpenseTypesIndexFiltersDraftFull,
    ExpenseTypesListFilters,
} from '@/pages/purchase/expense-types/types';

function ExpenseTypesIndex({
    can,
}: Pick<ExpenseTypesIndexPageProps, 'can'>) {
    const { deleteRow, deleteConfirmDialog } = useExpenseTypesIndex();
    const { formOpen, editingEntity, openCreate, openEdit, handleFormOpenChange } =
        useEntityFormDialogState<ExpenseType>();

    const columns = useMemo<TabledataColumn<ExpenseType>[]>(
        () => [
            {
                key: 'name',
                label: 'Nombre',
                sortable: true,
                hideable: false,
            },
            {
                key: 'abbreviation',
                label: 'Abreviatura',
                sortable: true,
                hideable: false,
            },
            buildTabledataCrudActionsColumn<ExpenseType>({
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

            <ExpenseTypesForm
                open={formOpen}
                onOpenChange={handleFormOpenChange}
                entity={editingEntity}
            />

            <TabledataProvider<
                ExpenseType,
                ExpenseTypesListFilters,
                ExpenseTypesIndexFiltersDraftFull
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
                emptyMessage="Ningún tipo de gasto coincide con la búsqueda."
                getRowKey={(row) => row.id}
                density="compact"
            />
        </>
    );
}

ExpenseTypesIndex.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.index(),
};

export default ExpenseTypesIndex;
