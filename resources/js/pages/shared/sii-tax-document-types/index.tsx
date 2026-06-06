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
import { CONFIG_TABLEDATA } from '@/pages/shared/sii-tax-document-types/config';
import { SiiTaxDocumentTypesIndexFilters } from '@/pages/shared/sii-tax-document-types/filters';
import { FormDialog } from '@/pages/shared/sii-tax-document-types/form-dialog';
import { useSiiTaxDocumentTypesIndex } from '@/pages/shared/sii-tax-document-types/hooks/use-index';
import type {
    SiiTaxDocumentType,
    SiiTaxDocumentTypeListFilters,
    SiiTaxDocumentTypesIndexFiltersDraftFull,
} from './types';
import { UsageBadges } from './usage-badges';

function SiiTaxDocumentTypesIndex() {
    const { deleteRow } = useSiiTaxDocumentTypesIndex();
    const { formOpen, editingEntity, openCreate, openEdit, handleFormOpenChange } =
        useEntityFormDialogState<SiiTaxDocumentType>();

    const columns = useMemo<TabledataColumn<SiiTaxDocumentType>[]>(
        () => [
            {
                key: 'code',
                label: 'Código',
                sortable: true,
                hideable: false,
                headerClassName: 'min-w-[72px]',
            },
            {
                key: 'name',
                label: 'Nombre',
                sortable: true,
                hideable: false,
                headerClassName: 'min-w-[200px]',
                className: 'max-w-md truncate',
            },
            {
                key: 'abbreviation',
                label: 'Abreviatura',
                sortable: true,
                headerClassName: 'min-w-[100px]',
            },
            {
                key: 'use_flags',
                label: 'Uso',
                hideable: true,
                headerClassName: 'min-w-[140px]',
                render: (row) => <UsageBadges row={row} />,
            },
            buildTabledataCrudActionsColumn<SiiTaxDocumentType>({
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
                siiTaxDocumentType={editingEntity}
            />

            <TabledataProvider<
                SiiTaxDocumentType,
                SiiTaxDocumentTypeListFilters,
                SiiTaxDocumentTypesIndexFiltersDraftFull
            >
                listConfig={pickTabledataListShellConfig(CONFIG_TABLEDATA)}
                listInertia={CONFIG_TABLEDATA.listInertia}
                columns={columns}
                toolbar={(list) => (
                    <>
                        <SiiTaxDocumentTypesIndexFilters
                            filters={list.filters}
                            setFilter={list.setFilter}
                            applyFilters={list.applyFilters}
                            resetFilters={list.resetFilters}
                        />
                        <Button type="button" onClick={openCreate}>
                            <CirclePlus />
                            Nuevo
                        </Button>
                    </>
                )}
                emptyMessage="Ningún tipo de documento coincide con la búsqueda."
                getRowKey={(row) => row.id}
                density="compact"
            />
        </>
    );
}

SiiTaxDocumentTypesIndex.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.index(),
};

export default SiiTaxDocumentTypesIndex;
