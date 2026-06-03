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
} from '@/pages/medic/species/config';
import type { SpeciesIndexPageProps } from '@/pages/medic/species/config';
import { SpeciesIndexFilters } from '@/pages/medic/species/filters';
import { SpeciesForm } from '@/pages/medic/species/form';
import { useSpeciesIndex } from '@/pages/medic/species/hooks/use-index';
import {
    formatIsActive,
} from '@/pages/medic/species/types';
import type { Species, SpeciesListFilters, SpeciesIndexFiltersDraftFull } from '@/pages/medic/species/types';

function SpeciesIndex({ can }: Pick<SpeciesIndexPageProps, 'can'>) {
    const { deleteRow } = useSpeciesIndex();
    const [formOpen, setFormOpen] = useState(false);
    const [editingSpecies, setEditingSpecies] = useState<Species | null>(null);

    const openCreate = useCallback(() => {
        setEditingSpecies(null);
        setFormOpen(true);
    }, []);

    const openEdit = useCallback((row: Species) => {
        setEditingSpecies(row);
        setFormOpen(true);
    }, []);

    const handleFormOpenChange = useCallback((open: boolean) => {
        setFormOpen(open);

        if (!open) {
            setEditingSpecies(null);
        }
    }, []);

    const columns = useMemo<TabledataColumn<Species>[]>(
        () => [
            {
                key: 'sort_order',
                label: 'Orden',
                sortable: true,
                hideable: false,
                headerClassName: 'w-0',
                render: (row) => row.sort_order,
            },
            {
                key: 'name',
                label: 'Nombre',
                sortable: true,
                hideable: false,
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

            <SpeciesForm
                open={formOpen}
                onOpenChange={handleFormOpenChange}
                entity={editingSpecies}
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
