import { Head } from '@inertiajs/react';
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
import { CONFIG_TABLEDATA } from '@/pages/medic/species/config';
import type { SpeciesIndexPageProps } from '@/pages/medic/species/config';
import { SpeciesIndexFilters } from '@/pages/medic/species/filters';
import { SpeciesForm } from '@/pages/medic/species/form';
import { useSpeciesIndex } from '@/pages/medic/species/hooks/use-index';
import { formatIsActive } from '@/pages/medic/species/types';
import type { Species, SpeciesListFilters, SpeciesIndexFiltersDraftFull } from '@/pages/medic/species/types';

function SpeciesIndex({ can }: Pick<SpeciesIndexPageProps, 'can'>) {
    const { deleteRow } = useSpeciesIndex();
    const { formOpen, editingEntity, openCreate, openEdit, handleFormOpenChange } =
        useEntityFormDialogState<Species>();

    const columns = useMemo<TabledataColumn<Species>[]>(
        () => [
            {
                key: 'name',
                label: 'Nombre',
                sortable: true,
                hideable: false,
            },
            buildTabledataIsActiveStatusColumn<Species>({ formatIsActive }),
            buildTabledataCrudActionsColumn<Species>({
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

            <SpeciesForm
                open={formOpen}
                onOpenChange={handleFormOpenChange}
                entity={editingEntity}
            />

            <TabledataProvider<Species, SpeciesListFilters, SpeciesIndexFiltersDraftFull>
                listConfig={pickTabledataListShellConfig(CONFIG_TABLEDATA)}
                listInertia={CONFIG_TABLEDATA.listInertia}
                columns={columns}
                toolbar={(list) => (
                    <>
                        <SpeciesIndexFilters
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
                emptyMessage="Ninguna especie coincide con la búsqueda o los filtros."
                getRowKey={(row) => row.id}
                density="compact"
            />
        </>
    );
}

SpeciesIndex.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.index(),
};

export default SpeciesIndex;
