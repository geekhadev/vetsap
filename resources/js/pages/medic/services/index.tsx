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
    buildTabledataWebVisibilityColumn,
} from '@/components/custom/tabledata-crud-actions';
import { Button } from '@/components/ui/button';
import { useEntityFormDialogState } from '@/hooks/use-entity-form-dialog-state';
import { CONFIG_TABLEDATA } from '@/pages/medic/services/config';
import type { ServicesIndexPageProps } from '@/pages/medic/services/config';
import { ServicesIndexFilters } from '@/pages/medic/services/filters';
import { ServiceForm } from '@/pages/medic/services/form';
import { useServicesIndex } from '@/pages/medic/services/hooks/use-index';
import {
    formatPrice,
    formatServiceDuration,
} from '@/pages/medic/services/types';
import type { Service, ServiceListFilters, ServicesIndexFiltersDraftFull } from '@/pages/medic/services/types';

function ServicesIndex() {
    const { can, specialties, time_block_minutes: timeBlockMinutes } =
        usePage<ServicesIndexPageProps>().props;
    const { deleteRow } = useServicesIndex();
    const { formOpen, editingEntity, openCreate, openEdit, handleFormOpenChange } =
        useEntityFormDialogState<Service>();

    const columns = useMemo<TabledataColumn<Service>[]>(
        () => [
            {
                key: 'name',
                label: 'Nombre',
                sortable: true,
                hideable: false,
            },
            {
                key: 'specialty',
                label: 'Especialidad',
                sortable: false,
                render: (row) => row.specialty?.name ?? '—',
            },
            {
                key: 'duration_minutes',
                label: 'Duración',
                sortable: true,
                render: (row) => formatServiceDuration(row.duration_minutes, timeBlockMinutes),
            },
            {
                key: 'price',
                label: 'Precio',
                sortable: true,
                render: (row) => formatPrice(row.price),
            },
            buildTabledataWebVisibilityColumn<Service>(),
            buildTabledataIsActiveStatusColumn<Service>(),
            buildTabledataCrudActionsColumn<Service>({
                can,
                onEdit: openEdit,
                onDelete: deleteRow,
            }),
        ],
        [can, deleteRow, openEdit, timeBlockMinutes],
    );

    return (
        <>
            <Head title={CONFIG_TABLEDATA.pageTitle} />

            <ServiceForm
                open={formOpen}
                onOpenChange={handleFormOpenChange}
                entity={editingEntity}
                specialties={specialties}
                timeBlockMinutes={timeBlockMinutes}
            />

            <TabledataProvider<Service, ServiceListFilters, ServicesIndexFiltersDraftFull>
                listConfig={pickTabledataListShellConfig(CONFIG_TABLEDATA)}
                listInertia={CONFIG_TABLEDATA.listInertia}
                columns={columns}
                toolbar={(list) => (
                    <>
                        <ServicesIndexFilters
                            filters={list.filters}
                            setFilter={list.setFilter}
                            applyFilters={list.applyFilters}
                            resetFilters={list.resetFilters}
                            specialties={specialties}
                        />
                        {can.create ? (
                            <Button type="button" onClick={openCreate}>
                                <CirclePlus />
                                Nuevo
                            </Button>
                        ) : null}
                    </>
                )}
                emptyMessage="Ningún servicio coincide con la búsqueda o los filtros."
                getRowKey={(row) => row.id}
                density="compact"
            />
        </>
    );
}

ServicesIndex.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.index(),
};

export default ServicesIndex;
