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
import {
    CONFIG_TABLEDATA,
} from '@/pages/medic/specialties/config';
import type { SpecialtiesIndexPageProps } from '@/pages/medic/specialties/config';
import { SpecialtiesIndexFilters } from '@/pages/medic/specialties/filters';
import { SpecialtyForm } from '@/pages/medic/specialties/form';
import { useSpecialtiesIndex } from '@/pages/medic/specialties/hooks/use-index';
import type { Specialty, SpecialtyListFilters, SpecialtiesIndexFiltersDraftFull } from '@/pages/medic/specialties/types';

function SpecialtiesIndex({ can }: Pick<SpecialtiesIndexPageProps, 'can'>) {
    const { deleteRow } = useSpecialtiesIndex();
    const { formOpen, editingEntity, openCreate, openEdit, handleFormOpenChange } =
        useEntityFormDialogState<Specialty>();

    const columns = useMemo<TabledataColumn<Specialty>[]>(
        () => [
            {
                key: 'name',
                label: 'Nombre',
                sortable: true,
                hideable: false,
            },
            {
                key: 'description',
                label: 'Descripción',
                sortable: false,
                render: (row) => row.description ?? '—',
            },
            buildTabledataIsActiveStatusColumn<Specialty>({ gender: 'f' }),
            buildTabledataCrudActionsColumn<Specialty>({
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

            <SpecialtyForm
                open={formOpen}
                onOpenChange={handleFormOpenChange}
                entity={editingEntity}
            />

            <TabledataProvider<Specialty, SpecialtyListFilters, SpecialtiesIndexFiltersDraftFull>
                listConfig={pickTabledataListShellConfig(CONFIG_TABLEDATA)}
                listInertia={CONFIG_TABLEDATA.listInertia}
                columns={columns}
                toolbar={(list) => (
                    <>
                        <SpecialtiesIndexFilters
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
                emptyMessage="Ninguna especialidad coincide con la búsqueda o los filtros."
                getRowKey={(row) => row.id}
                density="compact"
            />
        </>
    );
}

SpecialtiesIndex.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.index(),
};

export default SpecialtiesIndex;
