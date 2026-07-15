import { Head } from '@inertiajs/react';
import { CirclePlus } from 'lucide-react';
import { useMemo } from 'react';
import {
    pickTabledataListShellConfig,
    TabledataProvider,
} from '@/components/custom/tabledata';
import type { TabledataColumn } from '@/components/custom/tabledata';
import { buildTabledataCrudActionsColumn } from '@/components/custom/tabledata-crud-actions';
import { Button } from '@/components/ui/button';
import { useEntityFormDialogState } from '@/hooks/use-entity-form-dialog-state';
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
    const { deleteRow, deleteConfirmDialog } = useSiiEconomicActivitiesIndex();
    const { formOpen, editingEntity, openCreate, openEdit, handleFormOpenChange } =
        useEntityFormDialogState<SiiEconomicActivity>();

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
            buildTabledataCrudActionsColumn<SiiEconomicActivity>({
                onEdit: openEdit,
                onDelete: deleteRow,
            }),
        ],
        [deleteRow, openEdit],
    );

    return (
        <>
            {deleteConfirmDialog}
            <Head title={CONFIG_TABLEDATA.pageTitle} />

            <FormDialog
                open={formOpen}
                onOpenChange={handleFormOpenChange}
                siiEconomicActivity={editingEntity}
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
