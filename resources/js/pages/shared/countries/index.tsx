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
import { CONFIG_TABLEDATA } from '@/pages/shared/countries/config';
import { FormDialog } from '@/pages/shared/countries/form-dialog';
import { useCountriesIndex } from '@/pages/shared/countries/hooks/use-index';
import type {
    CountriesIndexFiltersDraftFull,
    Country,
    CountryListFilters,
} from './types';

function CountriesIndex() {
    const { deleteRow } = useCountriesIndex();
    const { formOpen, editingEntity, openCreate, openEdit, handleFormOpenChange } =
        useEntityFormDialogState<Country>();

    const columns = useMemo<TabledataColumn<Country>[]>(
        () => [
            {
                key: 'name',
                label: 'Nombre',
                sortable: true,
                hideable: false,
            },
            {
                key: 'name_code',
                label: 'Código',
                sortable: true,
                headerClassName: 'min-w-[80px]',
            },
            {
                key: 'phone_code',
                label: 'Teléfono',
                sortable: true,
                headerClassName: 'min-w-[100px]',
            },
            {
                key: 'currency_name',
                label: 'Moneda',
                sortable: true,
                headerClassName: 'min-w-[140px]',
            },
            {
                key: 'currency_symbol',
                label: 'Símbolo',
                sortable: true,
                headerClassName: 'min-w-[100px]',
            },
            buildTabledataCrudActionsColumn<Country>({
                onEdit: openEdit,
                onDelete: deleteRow,
            }),
        ],
        [deleteRow, openEdit],
    );

    return (
        <>
            <Head title={CONFIG_TABLEDATA.pageTitle} />

            <FormDialog
                open={formOpen}
                onOpenChange={handleFormOpenChange}
                country={editingEntity}
            />

            <TabledataProvider<
                Country,
                CountryListFilters,
                CountriesIndexFiltersDraftFull
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
                emptyMessage="Ningún país coincide con la búsqueda."
                getRowKey={(row) => row.id}
                density="compact"
            />
        </>
    );
}

CountriesIndex.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.index(),
};

export default CountriesIndex;
