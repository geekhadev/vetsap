import { Head } from '@inertiajs/react';
import { CirclePlus, PencilIcon, TrashIcon } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import {
    pickTabledataListShellConfig,
    TabledataProvider,
} from '@/components/custom/tabledata';
import type { TabledataColumn } from '@/components/custom/tabledata';
import { Button } from '@/components/ui/button';
import { CONFIG_TABLEDATA } from '@/pages/shared/sii-economic-activities/config';
import { FormDialog } from '@/pages/shared/sii-economic-activities/form-dialog';
import { useSiiEconomicActivitiesIndex } from '@/pages/shared/sii-economic-activities/hooks/use-index';
import type {
    SiiEconomicActivitiesIndexFiltersDraftFull,
    SiiEconomicActivity,
    SiiEconomicActivityListFilters,
} from './types';

function yesNo(value: boolean): string {
    return value ? 'Sí' : 'No';
}

function SiiEconomicActivitiesIndex() {
    const { deleteRow } = useSiiEconomicActivitiesIndex();
    const [formOpen, setFormOpen] = useState(false);
    const [editingActivity, setEditingActivity] =
        useState<SiiEconomicActivity | null>(null);

    const openCreate = useCallback(() => {
        setEditingActivity(null);
        setFormOpen(true);
    }, []);

    const openEdit = useCallback((row: SiiEconomicActivity) => {
        setEditingActivity(row);
        setFormOpen(true);
    }, []);

    const handleFormOpenChange = useCallback((open: boolean) => {
        setFormOpen(open);

        if (!open) {
            setEditingActivity(null);
        }
    }, []);

    const columns = useMemo<TabledataColumn<SiiEconomicActivity>[]>(
        () => [
            {
                key: 'code',
                label: 'Código',
                sortable: true,
                hideable: false,
                headerClassName: 'min-w-[88px]',
            },
            {
                key: 'description',
                label: 'Descripción',
                sortable: true,
                hideable: false,
                headerClassName: 'min-w-[200px]',
            },
            {
                key: 'use_iva',
                label: 'IVA',
                sortable: true,
                headerClassName: 'min-w-[72px]',
                render: (row) => yesNo(row.use_iva),
            },
            {
                key: 'tax_category',
                label: 'Cat. tributaria',
                sortable: true,
                headerClassName: 'min-w-[100px]',
            },
            {
                key: 'use_internet',
                label: 'Internet',
                sortable: true,
                headerClassName: 'min-w-[88px]',
                render: (row) => yesNo(row.use_internet),
            },
            {
                key: 'actions',
                label: 'Acciones',
                hideable: false,
                headerClassName: 'w-0 text-right',
                render: (row) => (
                    <div className="flex justify-end gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            type="button"
                            onClick={() => openEdit(row)}
                        >
                            <PencilIcon className="size-3" />
                        </Button>
                        <Button
                            variant="destructive"
                            size="icon"
                            className="p-0.5"
                            type="button"
                            onClick={() => deleteRow(row)}
                        >
                            <TrashIcon className="size-3" />
                        </Button>
                    </div>
                ),
            },
        ],
        [deleteRow, openEdit],
    );

    return (
        <>
            <Head title={CONFIG_TABLEDATA.pageTitle} />

            <FormDialog
                open={formOpen}
                onOpenChange={handleFormOpenChange}
                siiEconomicActivity={editingActivity}
            />

            <TabledataProvider<
                SiiEconomicActivity,
                SiiEconomicActivityListFilters,
                SiiEconomicActivitiesIndexFiltersDraftFull
            >
                listConfig={pickTabledataListShellConfig(CONFIG_TABLEDATA)}
                listInertia={CONFIG_TABLEDATA.listInertia}
                columns={columns}
                toolbar={
                    <Button type="button" onClick={openCreate}>
                        <CirclePlus />
                        Nuevo
                    </Button>
                }
                emptyMessage="Ninguna actividad coincide con la búsqueda."
                getRowKey={(row) => row.id}
                density="compact"
            />
        </>
    );
}

SiiEconomicActivitiesIndex.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.index(),
};

export default SiiEconomicActivitiesIndex;
