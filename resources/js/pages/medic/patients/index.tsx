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
import { CONFIG_TABLEDATA } from '@/pages/medic/patients/config';
import type { PatientsIndexPageProps } from '@/pages/medic/patients/config';
import { PatientsIndexFilters } from '@/pages/medic/patients/filters';
import { PatientForm } from '@/pages/medic/patients/form';
import { usePatientsIndex } from '@/pages/medic/patients/hooks/use-index';
import { formatSex } from '@/pages/medic/patients/types';
import type {
    Patient,
    PatientListFilters,
    PatientsIndexFiltersDraftFull,
} from '@/pages/medic/patients/types';

function PatientsIndex({
    can,
    species,
    customers,
}: Pick<PatientsIndexPageProps, 'can' | 'species' | 'customers'>) {
    const { deleteRow } = usePatientsIndex();
    const { formOpen, editingEntity, openCreate, openEdit, handleFormOpenChange } =
        useEntityFormDialogState<Patient>();

    const columns = useMemo<TabledataColumn<Patient>[]>(
        () => [
            {
                key: 'record_number',
                label: 'Ficha',
                sortable: true,
                hideable: false,
            },
            {
                key: 'name',
                label: 'Nombre',
                sortable: true,
                hideable: false,
            },
            {
                key: 'customer',
                label: 'Cliente',
                sortable: false,
                render: (row) => row.customer?.name ?? '—',
            },
            {
                key: 'species',
                label: 'Especie',
                sortable: false,
                render: (row) => row.species?.name ?? '—',
            },
            {
                key: 'breed',
                label: 'Raza',
                sortable: false,
                render: (row) => row.breed ?? '—',
            },
            {
                key: 'sex',
                label: 'Sexo',
                sortable: false,
                render: (row) => formatSex(row.sex),
            },
            buildTabledataIsActiveStatusColumn<Patient>({ gender: 'm' }),
            buildTabledataCrudActionsColumn<Patient>({
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

            <PatientForm
                open={formOpen}
                onOpenChange={handleFormOpenChange}
                entity={editingEntity}
                speciesOptions={species}
                customerOptions={customers}
            />

            <TabledataProvider<Patient, PatientListFilters, PatientsIndexFiltersDraftFull>
                listConfig={pickTabledataListShellConfig(CONFIG_TABLEDATA)}
                listInertia={CONFIG_TABLEDATA.listInertia}
                columns={columns}
                toolbar={(list) => (
                    <>
                        <PatientsIndexFilters
                            filters={list.filters}
                            setFilter={list.setFilter}
                            applyFilters={list.applyFilters}
                            resetFilters={list.resetFilters}
                            species={species}
                            customers={customers}
                        />
                        {can.create ? (
                            <Button type="button" onClick={openCreate}>
                                <CirclePlus />
                                Nuevo
                            </Button>
                        ) : null}
                    </>
                )}
                emptyMessage="Ningún paciente coincide con la búsqueda o los filtros."
                getRowKey={(row) => row.id}
                density="compact"
            />
        </>
    );
}

PatientsIndex.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.index(),
};

export default PatientsIndex;
