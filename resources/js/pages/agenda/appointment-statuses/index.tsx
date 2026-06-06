import { Head } from '@inertiajs/react';
import { CirclePlus } from 'lucide-react';
import { useMemo } from 'react';
import { AppointmentStatusColorBadge } from '@/components/custom/appointment-status-color-badge';
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
import { isAppointmentStatusColorValue } from '@/lib/appointment-status-colors';
import {
    canDeleteGlobalRecordRow,
    canModifyGlobalRecordRow,
} from '@/lib/global-record';
import { renderMasterRecordName } from '@/lib/store-master-record';
import { CONFIG_TABLEDATA } from '@/pages/agenda/appointment-statuses/config';
import type { AppointmentStatusesIndexPageProps } from '@/pages/agenda/appointment-statuses/config';
import { AppointmentStatusesIndexFilters } from '@/pages/agenda/appointment-statuses/filters';
import { AppointmentStatusesForm } from '@/pages/agenda/appointment-statuses/form';
import { useAppointmentStatusesIndex } from '@/pages/agenda/appointment-statuses/hooks/use-index';
import type {
    AppointmentStatus,
    AppointmentStatusesListFilters,
    AppointmentStatusesIndexFiltersDraftFull,
} from '@/pages/agenda/appointment-statuses/types';

function AppointmentStatusesIndex({
    can,
}: Pick<AppointmentStatusesIndexPageProps, 'can'>) {
    const { deleteRow } = useAppointmentStatusesIndex();
    const { formOpen, editingEntity, openCreate, openEdit, handleFormOpenChange } =
        useEntityFormDialogState<AppointmentStatus>();

    const columns = useMemo<TabledataColumn<AppointmentStatus>[]>(
        () => [
            {
                key: 'name',
                label: 'Nombre',
                sortable: true,
                hideable: false,
                render: (row) => renderMasterRecordName(row.name, row.company_id),
            },
            {
                key: 'color',
                label: 'Color',
                sortable: true,
                hideable: false,
                render: (row) =>
                    isAppointmentStatusColorValue(row.color) ? (
                        <AppointmentStatusColorBadge
                            color={row.color}
                            label={row.name}
                        />
                    ) : (
                        row.color
                    ),
            },
            buildTabledataIsActiveStatusColumn<AppointmentStatus>({ gender: 'm' }),
            buildTabledataCrudActionsColumn<AppointmentStatus>({
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
            <Head title={CONFIG_TABLEDATA.pageTitle} />

            <AppointmentStatusesForm
                open={formOpen}
                onOpenChange={handleFormOpenChange}
                entity={editingEntity}
            />

            <TabledataProvider<
                AppointmentStatus,
                AppointmentStatusesListFilters,
                AppointmentStatusesIndexFiltersDraftFull
            >
                listConfig={pickTabledataListShellConfig(CONFIG_TABLEDATA)}
                listInertia={CONFIG_TABLEDATA.listInertia}
                columns={columns}
                toolbar={(list) => (
                    <>
                        <AppointmentStatusesIndexFilters
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
                emptyMessage="Ningún estado de cita coincide con la búsqueda o los filtros."
                getRowKey={(row) => row.id}
                density="compact"
            />
        </>
    );
}

AppointmentStatusesIndex.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.index(),
};

export default AppointmentStatusesIndex;
