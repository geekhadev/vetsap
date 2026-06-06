import { Head, usePage } from '@inertiajs/react';
import {
    CalendarClock,
    CirclePlus,
    ListChecks,
    PencilIcon,
    TrashIcon,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { DocumentBadge } from '@/components/custom/document-badge';
import {
    pickTabledataListShellConfig,
    TabledataProvider,
} from '@/components/custom/tabledata';
import type { TabledataColumn } from '@/components/custom/tabledata';
import {
    buildTabledataConfiguredStatusColumn,
    buildTabledataIsActiveStatusColumn,
    buildTabledataWebVisibilityColumn,
} from '@/components/custom/tabledata-crud-actions';
import { Button } from '@/components/ui/button';
import { useEntityFormDialogState } from '@/hooks/use-entity-form-dialog-state';
import { CONFIG_TABLEDATA } from '@/pages/medic/doctors/config';
import type { DoctorsIndexPageProps } from '@/pages/medic/doctors/config';
import { DoctorScheduleForm } from '@/pages/medic/doctors/doctor-schedule-form';
import { DoctorServicesForm } from '@/pages/medic/doctors/doctor-services-form';
import { DoctorsIndexFilters } from '@/pages/medic/doctors/filters';
import { DoctorForm } from '@/pages/medic/doctors/form';
import { useDoctorsIndex } from '@/pages/medic/doctors/hooks/use-index';
import {
    formatDoctorName,
    hasDoctorScheduleConfigured,
    hasDoctorServicesConfigured,
} from '@/pages/medic/doctors/types';
import type {
    Doctor,
    DoctorListFilters,
    DoctorsIndexFiltersDraftFull,
} from '@/pages/medic/doctors/types';

function DoctorsIndex() {
    const { can, services } = usePage<DoctorsIndexPageProps>().props;
    const { deleteRow } = useDoctorsIndex();
    const { formOpen, editingEntity, openCreate, openEdit, handleFormOpenChange } =
        useEntityFormDialogState<Doctor>();
    const [servicesDoctor, setServicesDoctor] = useState<Doctor | null>(null);
    const [servicesFormOpen, setServicesFormOpen] = useState(false);
    const [scheduleDoctor, setScheduleDoctor] = useState<Doctor | null>(null);
    const [scheduleFormOpen, setScheduleFormOpen] = useState(false);

    const openSchedule = useCallback((row: Doctor) => {
        setScheduleDoctor(row);
        setScheduleFormOpen(true);
    }, []);

    const handleScheduleFormOpenChange = useCallback((open: boolean) => {
        setScheduleFormOpen(open);

        if (!open) {
            setScheduleDoctor(null);
        }
    }, []);

    const openServices = useCallback((row: Doctor) => {
        setServicesDoctor(row);
        setServicesFormOpen(true);
    }, []);

    const handleServicesFormOpenChange = useCallback((open: boolean) => {
        setServicesFormOpen(open);

        if (!open) {
            setServicesDoctor(null);
        }
    }, []);

    const columns = useMemo<TabledataColumn<Doctor>[]>(
        () => [
            {
                key: 'first_name',
                label: 'Nombre',
                sortable: true,
                hideable: false,
                render: (row) => formatDoctorName(row),
            },
            {
                key: 'document_type',
                label: 'Documento',
                sortable: false,
                render: (row) => (
                    <DocumentBadge
                        documentType={row.document_type}
                        documentNumber={row.document_number}
                    />
                ),
            },
            buildTabledataConfiguredStatusColumn<Doctor>({
                key: 'services_status',
                label: 'Servicios',
                isConfigured: hasDoctorServicesConfigured,
                icon: ListChecks,
            }),
            buildTabledataConfiguredStatusColumn<Doctor>({
                key: 'schedule_status',
                label: 'Horarios',
                isConfigured: hasDoctorScheduleConfigured,
                icon: CalendarClock,
            }),
            buildTabledataWebVisibilityColumn<Doctor>(),
            buildTabledataIsActiveStatusColumn<Doctor>(),
            {
                key: 'actions',
                label: 'Acciones',
                sortable: false,
                hideable: false,
                headerClassName: 'w-0 text-right',
                render: (row) => {
                    const scheduleConfigured = hasDoctorScheduleConfigured(row);
                    const servicesConfigured = hasDoctorServicesConfigured(row);

                    return (
                    <div className="flex justify-end gap-1">
                        {can.update ? (
                            <Button
                                variant={
                                    scheduleConfigured ? 'outline' : 'destructive'
                                }
                                size="icon"
                                type="button"
                                title={
                                    scheduleConfigured
                                        ? 'Configurar horarios'
                                        : 'Horarios sin configurar'
                                }
                                onClick={() => openSchedule(row)}
                            >
                                <CalendarClock className="size-3" />
                            </Button>
                        ) : null}
                        {can.update ? (
                            <Button
                                variant={
                                    servicesConfigured ? 'outline' : 'destructive'
                                }
                                size="icon"
                                type="button"
                                title={
                                    servicesConfigured
                                        ? 'Gestionar servicios'
                                        : 'Servicios sin configurar'
                                }
                                onClick={() => openServices(row)}
                            >
                                <ListChecks className="size-3" />
                            </Button>
                        ) : null}
                        {can.update ? (
                            <Button
                                variant="outline"
                                size="icon"
                                type="button"
                                title="Editar ficha"
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
                                title="Eliminar"
                                onClick={() => deleteRow(row)}
                            >
                                <TrashIcon className="size-3" />
                            </Button>
                        ) : null}
                    </div>
                    );
                },
            },
        ],
        [can.delete, can.update, deleteRow, openEdit, openSchedule, openServices],
    );

    return (
        <>
            <Head title={CONFIG_TABLEDATA.pageTitle} />

            <DoctorForm
                open={formOpen}
                onOpenChange={handleFormOpenChange}
                entity={editingEntity}
            />

            <DoctorServicesForm
                open={servicesFormOpen}
                onOpenChange={handleServicesFormOpenChange}
                doctor={servicesDoctor}
                serviceOptions={services}
            />

            <DoctorScheduleForm
                open={scheduleFormOpen}
                onOpenChange={handleScheduleFormOpenChange}
                doctor={scheduleDoctor}
            />

            <TabledataProvider<Doctor, DoctorListFilters, DoctorsIndexFiltersDraftFull>
                listConfig={pickTabledataListShellConfig(CONFIG_TABLEDATA)}
                listInertia={CONFIG_TABLEDATA.listInertia}
                columns={columns}
                toolbar={(list) => (
                    <>
                        <DoctorsIndexFilters
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
                emptyMessage="Ningún doctor coincide con la búsqueda o los filtros."
                getRowKey={(row) => row.id}
                density="compact"
            />
        </>
    );
}

DoctorsIndex.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.index(),
};

export default DoctorsIndex;
