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
import { CONFIG_TABLEDATA } from '@/pages/medic/vaccination-protocols/config';
import type { VaccinationProtocolsIndexPageProps } from '@/pages/medic/vaccination-protocols/config';
import { VaccinationProtocolsIndexFilters } from '@/pages/medic/vaccination-protocols/filters';
import { VaccinationProtocolForm } from '@/pages/medic/vaccination-protocols/form';
import { useVaccinationProtocolsIndex } from '@/pages/medic/vaccination-protocols/hooks/use-index';
import type {
    VaccinationProtocol,
    VaccinationProtocolListFilters,
    VaccinationProtocolsIndexFiltersDraftFull,
} from '@/pages/medic/vaccination-protocols/types';

function VaccinationProtocolsIndex({
    can,
    species,
    vaccineProducts,
}: Pick<
    VaccinationProtocolsIndexPageProps,
    'can' | 'species' | 'vaccineProducts'
>) {
    const { deleteRow, deleteConfirmDialog } = useVaccinationProtocolsIndex();
    const { formOpen, editingEntity, openCreate, openEdit, handleFormOpenChange } =
        useEntityFormDialogState<VaccinationProtocol>();

    const columns = useMemo<TabledataColumn<VaccinationProtocol>[]>(
        () => [
            {
                key: 'name',
                label: 'Nombre',
                sortable: true,
                hideable: false,
            },
            {
                key: 'species',
                label: 'Especie',
                sortable: false,
                render: (row) => row.species?.name ?? '—',
            },
            {
                key: 'version',
                label: 'Versión',
                sortable: true,
            },
            {
                key: 'items_count',
                label: 'Dosis',
                sortable: false,
                render: (row) => String(row.items_count ?? row.items?.length ?? 0),
            },
            buildTabledataIsActiveStatusColumn<VaccinationProtocol>({
                gender: 'm',
            }),
            buildTabledataCrudActionsColumn<VaccinationProtocol>({
                can,
                onEdit: openEdit,
                onDelete: deleteRow,
            }),
        ],
        [can, deleteRow, openEdit],
    );

    return (
        <>
            {deleteConfirmDialog}
            <Head title={CONFIG_TABLEDATA.pageTitle} />

            <VaccinationProtocolForm
                open={formOpen}
                onOpenChange={handleFormOpenChange}
                entity={editingEntity}
                species={species}
                vaccineProducts={vaccineProducts}
            />

            <TabledataProvider<
                VaccinationProtocol,
                VaccinationProtocolListFilters,
                VaccinationProtocolsIndexFiltersDraftFull
            >
                listConfig={pickTabledataListShellConfig(CONFIG_TABLEDATA)}
                listInertia={CONFIG_TABLEDATA.listInertia}
                columns={columns}
                toolbar={(list) => (
                    <>
                        <VaccinationProtocolsIndexFilters
                            filters={list.filters}
                            setFilter={list.setFilter}
                            applyFilters={list.applyFilters}
                            resetFilters={list.resetFilters}
                            species={species}
                        />
                        {can.create ? (
                            <Button type="button" onClick={openCreate}>
                                <CirclePlus />
                                Nuevo
                            </Button>
                        ) : null}
                    </>
                )}
                emptyMessage="Ningún protocolo coincide con la búsqueda o los filtros."
                getRowKey={(row) => row.id}
                density="compact"
            />
        </>
    );
}

VaccinationProtocolsIndex.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.index(),
};

export default VaccinationProtocolsIndex;
