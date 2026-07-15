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
import type { ModulesIndexPageProps } from '@/pages/administration/modules/config';
import { CONFIG_TABLEDATA } from '@/pages/administration/modules/config';
import { ModulesIndexFilters } from '@/pages/administration/modules/filters';
import { FormDialog } from '@/pages/administration/modules/form-dialog';
import { useModulesIndex } from '@/pages/administration/modules/hooks/use-index';
import type {
    Module,
    ModuleListFilters,
    ModulesIndexFiltersDraftFull,
} from './types';

function ModulesIndex() {
    const { systems } = usePage<ModulesIndexPageProps>().props;
    const { deleteRow, deleteConfirmDialog } = useModulesIndex();
    const { formOpen, editingEntity, openCreate, openEdit, handleFormOpenChange } =
        useEntityFormDialogState<Module>();

    const columns = useMemo<TabledataColumn<Module>[]>(
        () => [
            {
                key: 'system',
                label: 'Sistema',
                sortable: false,
                hideable: false,
                render: (row) => row.system?.name ?? '—',
            },
            {
                key: 'name',
                label: 'Nombre',
                sortable: true,
                hideable: false,
            },
            {
                key: 'slug',
                label: 'Slug',
                sortable: true,
                hideable: false,
            },
            buildTabledataCrudActionsColumn<Module>({
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
                module={editingEntity}
                systems={systems}
            />

            <TabledataProvider<Module, ModuleListFilters, ModulesIndexFiltersDraftFull>
                listConfig={pickTabledataListShellConfig(CONFIG_TABLEDATA)}
                listInertia={CONFIG_TABLEDATA.listInertia}
                columns={columns}
                toolbar={(list) => (
                    <>
                        <ModulesIndexFilters
                            filters={list.filters}
                            setFilter={list.setFilter}
                            applyFilters={list.applyFilters}
                            resetFilters={list.resetFilters}
                            systems={systems}
                        />
                        <Button type="button" onClick={openCreate}>
                            <CirclePlus />
                            Nuevo
                        </Button>
                    </>
                )}
                emptyMessage="Ningún módulo coincide con la búsqueda o el filtro."
                getRowKey={(row) => row.id}
                density="compact"
            />
        </>
    );
}

ModulesIndex.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.index(),
};

export default ModulesIndex;
