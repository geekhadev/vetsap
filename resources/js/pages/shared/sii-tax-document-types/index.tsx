import { Head } from '@inertiajs/react';
import { CirclePlus, PencilIcon, TrashIcon } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import {
    pickTabledataListShellConfig,
    TabledataProvider,
} from '@/components/custom/tabledata';
import type { TabledataColumn } from '@/components/custom/tabledata';
import { Button } from '@/components/ui/button';
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
    const [formOpen, setFormOpen] = useState(false);
    const [editingRow, setEditingRow] = useState<SiiTaxDocumentType | null>(null);

    const openCreate = useCallback(() => {
        setEditingRow(null);
        setFormOpen(true);
    }, []);

    const openEdit = useCallback((row: SiiTaxDocumentType) => {
        setEditingRow(row);
        setFormOpen(true);
    }, []);

    const handleFormOpenChange = useCallback((open: boolean) => {
        setFormOpen(open);

        if (!open) {
            setEditingRow(null);
        }
    }, []);

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
                siiTaxDocumentType={editingRow}
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
