import { Head } from '@inertiajs/react';
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
    CONFIG_TABLEDATA,
} from '@/pages/medic/specialties/config';
import type { SpecialtiesIndexPageProps } from '@/pages/medic/specialties/config';
import { SpecialtiesIndexFilters } from '@/pages/medic/specialties/filters';
import { SpecialtyForm } from '@/pages/medic/specialties/form';
import { useSpecialtiesIndex } from '@/pages/medic/specialties/hooks/use-index';
import {
    formatIsActive,
} from '@/pages/medic/specialties/types';
import type { Specialty, SpecialtyListFilters, SpecialtiesIndexFiltersDraftFull } from '@/pages/medic/specialties/types';

function SpecialtiesIndex({ can }: Pick<SpecialtiesIndexPageProps, 'can'>) {
    const { deleteRow } = useSpecialtiesIndex();
    const [formOpen, setFormOpen] = useState(false);
    const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);

    const openCreate = useCallback(() => {
        setEditingSpecialty(null);
        setFormOpen(true);
    }, []);

    const openEdit = useCallback((row: Specialty) => {
        setEditingSpecialty(row);
        setFormOpen(true);
    }, []);

    const handleFormOpenChange = useCallback((open: boolean) => {
        setFormOpen(open);

        if (!open) {
            setEditingSpecialty(null);
        }
    }, []);

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

            <SpecialtyForm
                open={formOpen}
                onOpenChange={handleFormOpenChange}
                entity={editingSpecialty}
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
