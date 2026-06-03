import { Head, usePage } from '@inertiajs/react';
import { CirclePlus, PencilIcon, TrashIcon } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import {
    pickTabledataListShellConfig,
    TabledataProvider,
} from '@/components/custom/tabledata';
import type { TabledataColumn } from '@/components/custom/tabledata';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    CONFIG_TABLEDATA
    
} from '@/pages/medic/services/config';
import type {ServicesIndexPageProps} from '@/pages/medic/services/config';
import { ServicesIndexFilters } from '@/pages/medic/services/filters';
import { ServiceForm } from '@/pages/medic/services/form';
import { useServicesIndex } from '@/pages/medic/services/hooks/use-index';
import {
    formatDuration,
    formatIsActive,
    formatPrice,
    formatPublicBooking,
} from '@/pages/medic/services/types';
import type { Service, ServiceListFilters, ServicesIndexFiltersDraftFull } from '@/pages/medic/services/types';

function ServicesIndex() {
    const { can, specialties } = usePage<ServicesIndexPageProps>().props;
    const { deleteRow } = useServicesIndex();
    const [formOpen, setFormOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);

    const openCreate = useCallback(() => {
        setEditingService(null);
        setFormOpen(true);
    }, []);

    const openEdit = useCallback((row: Service) => {
        setEditingService(row);
        setFormOpen(true);
    }, []);

    const handleFormOpenChange = useCallback((open: boolean) => {
        setFormOpen(open);

        if (!open) {
            setEditingService(null);
        }
    }, []);

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
                render: (row) => formatDuration(row.duration_minutes),
            },
            {
                key: 'price',
                label: 'Precio',
                sortable: true,
                render: (row) => formatPrice(row.price),
            },
            {
                key: 'is_active',
                label: 'Estado',
                sortable: true,
                render: (row) => (
                    <Badge variant={row.is_active ? 'default' : 'secondary'}>
                        {formatIsActive(row.is_active)}
                    </Badge>
                ),
            },
            {
                key: 'is_public_booking',
                label: 'Citas web',
                sortable: true,
                render: (row) => (
                    <Badge
                        variant={
                            row.is_public_booking ? 'default' : 'secondary'
                        }
                    >
                        {formatPublicBooking(row.is_public_booking)}
                    </Badge>
                ),
            },
            {
                key: 'actions',
                label: 'Acciones',
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
            <Head title={CONFIG_TABLEDATA.pageTitle} />

            <ServiceForm
                open={formOpen}
                onOpenChange={handleFormOpenChange}
                entity={editingService}
                specialties={specialties}
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
