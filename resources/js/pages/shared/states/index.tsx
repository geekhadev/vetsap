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
import { CONFIG_TABLEDATA  } from '@/pages/shared/states/config';
import type {StatesIndexPageProps} from '@/pages/shared/states/config';
import { StatesIndexFilters } from '@/pages/shared/states/filters';
import { FormDialog } from '@/pages/shared/states/form-dialog';
import { useStatesIndex } from '@/pages/shared/states/hooks/use-index';
import type { State, StateListFilters, StatesIndexFiltersDraftFull } from './types';

function StatesIndex({ countries }: Pick<StatesIndexPageProps, 'countries'>) {
    const { deleteRow } = useStatesIndex();
    const { formOpen, editingEntity, openCreate, openEdit, handleFormOpenChange } =
        useEntityFormDialogState<State>();

    const columns = useMemo<TabledataColumn<State>[]>(
        () => [
            {
                key: 'name',
                label: 'Nombre',
                sortable: true,
                hideable: false,
            },
            {
                key: 'country',
                label: 'Pais',
                sortable: true,
                render: (row) => row.country?.name ?? '—',
            },
            buildTabledataCrudActionsColumn<State>({
                onEdit: openEdit,
                onDelete: deleteRow,
            }),
        ],
        [deleteRow, openEdit],
    );

    return (
        <>
            <Head title={CONFIG_TABLEDATA.pageTitle} />

            <FormDialog
                open={formOpen}
                onOpenChange={handleFormOpenChange}
                entity={editingEntity}
                countries={countries}
            />

            <TabledataProvider<State, StateListFilters, StatesIndexFiltersDraftFull>
                listConfig={pickTabledataListShellConfig(CONFIG_TABLEDATA)}
                listInertia={CONFIG_TABLEDATA.listInertia}
                columns={columns}
                toolbar={(list) => (
                    <>
                        <StatesIndexFilters
                            filters={list.filters}
                            setFilter={list.setFilter}
                            applyFilters={list.applyFilters}
                            resetFilters={list.resetFilters}
                            countries={countries}
                        />
                        <Button type="button" onClick={openCreate}>
                            <CirclePlus />
                            Nuevo
                        </Button>
                    </>
                )}
                emptyMessage="Ningun estado coincide con la busqueda o los filtros."
                getRowKey={(row) => row.id}
                density="compact"
            />
        </>
    );
}

StatesIndex.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.index(),
};

export default StatesIndex;
