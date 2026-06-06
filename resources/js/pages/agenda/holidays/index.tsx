import { Head } from '@inertiajs/react';
import { CirclePlus } from 'lucide-react';
import { useMemo } from 'react';
import { DateDisplay } from '@/components/custom/date-display';
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
import { CONFIG_TABLEDATA } from '@/pages/agenda/holidays/config';
import type { HolidaysIndexPageProps } from '@/pages/agenda/holidays/config';
import { HolidaysIndexFilters } from '@/pages/agenda/holidays/filters';
import { HolidaysForm } from '@/pages/agenda/holidays/form';
import { useHolidaysIndex } from '@/pages/agenda/holidays/hooks/use-index';
import type {
    Holiday,
    HolidaysListFilters,
    HolidaysIndexFiltersDraftFull,
} from '@/pages/agenda/holidays/types';

function HolidaysIndex({ can }: Pick<HolidaysIndexPageProps, 'can'>) {
    const { deleteRow } = useHolidaysIndex();
    const { formOpen, editingEntity, openCreate, openEdit, handleFormOpenChange } =
        useEntityFormDialogState<Holiday>();

    const columns = useMemo<TabledataColumn<Holiday>[]>(
        () => [
            {
                key: 'name',
                label: 'Nombre',
                sortable: true,
                hideable: false,
            },
            {
                key: 'date',
                label: 'Fecha',
                sortable: true,
                hideable: false,
                render: (row) => <DateDisplay value={row.date} mode="date" />,
            },
            buildTabledataIsActiveStatusColumn<Holiday>({ gender: 'm' }),
            buildTabledataCrudActionsColumn<Holiday>({
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

            <HolidaysForm
                open={formOpen}
                onOpenChange={handleFormOpenChange}
                entity={editingEntity}
            />

            <TabledataProvider<Holiday, HolidaysListFilters, HolidaysIndexFiltersDraftFull>
                listConfig={pickTabledataListShellConfig(CONFIG_TABLEDATA)}
                listInertia={CONFIG_TABLEDATA.listInertia}
                columns={columns}
                toolbar={(list) => (
                    <>
                        <HolidaysIndexFilters
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
                emptyMessage="Ningún día feriado coincide con la búsqueda o los filtros."
                getRowKey={(row) => row.id}
                density="compact"
            />
        </>
    );
}

HolidaysIndex.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.index(),
};

export default HolidaysIndex;
