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
} from '@/components/custom/tabledata-crud-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEntityFormDialogState } from '@/hooks/use-entity-form-dialog-state';
import { CONFIG_TABLEDATA } from '@/pages/medic/doctors/config';
import type { DoctorsIndexPageProps } from '@/pages/medic/doctors/config';
import { DoctorsIndexFilters } from '@/pages/medic/doctors/filters';
import { DoctorForm } from '@/pages/medic/doctors/form';
import { useDoctorsIndex } from '@/pages/medic/doctors/hooks/use-index';
import {
    formatDoctorName,
    formatDocumentType,
    formatIsActive,
    formatUseWeb,
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
                    <span>
                        {formatDocumentType(row.document_type)}{' '}
                        <span className="text-muted-foreground">
                            {row.document_number}
                        </span>
                    </span>
                ),
            },
            {
                key: 'services_count',
                label: 'Servicios',
                sortable: false,
                render: (row) => row.services_count ?? 0,
            },
            buildTabledataIsActiveStatusColumn<Doctor>({ formatIsActive }),
            {
                key: 'use_web',
                label: 'Citas web',
                sortable: true,
                render: (row) => (
                    <Badge variant={row.use_web ? 'default' : 'secondary'}>
                        {formatUseWeb(row.use_web)}
                    </Badge>
                ),
            },
            buildTabledataCrudActionsColumn<Doctor>({
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

            <DoctorForm
                open={formOpen}
                onOpenChange={handleFormOpenChange}
                entity={editingEntity}
                services={services}
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
