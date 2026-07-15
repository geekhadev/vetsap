import { Head, router, usePage } from '@inertiajs/react';
import { CirclePlus, ListIcon, TrashIcon } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { DateDisplay } from '@/components/custom/date-display';
import { SiiIntegrationIncompleteAlert } from '@/components/custom/sii-integration-incomplete-alert';
import {
    pickTabledataListShellConfig,
    TabledataProvider,
    tabledataListFiltersToQueryWithModuleKeys,
} from '@/components/custom/tabledata';
import type { TabledataColumn } from '@/components/custom/tabledata';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEntityFormDialogState } from '@/hooks/use-entity-form-dialog-state';
import {
    CONFIG_TABLEDATA,

    SII_CAFS_INDEX_INERTIA_ONLY
} from '@/pages/sale/sii-cafs/config';
import type {SiiCafsIndexPageProps} from '@/pages/sale/sii-cafs/config';
import { SiiCafsIndexFilters } from '@/pages/sale/sii-cafs/filters';
import { FoliosDialog } from '@/pages/sale/sii-cafs/folios-dialog';
import { FormDialog } from '@/pages/sale/sii-cafs/form-dialog';
import { useSiiCafsIndex } from '@/pages/sale/sii-cafs/hooks/use-index';
import type {
    SiiCafListFilters,
    SiiCafRow,
    SiiCafStatusValue,
    SiiCafsIndexFiltersDraftFull,
} from '@/pages/sale/sii-cafs/types';
import { SII_CAFS_INDEX_MODULE_FILTER_KEYS } from '@/pages/sale/sii-cafs/types';
import { index as siiCafsIndex } from '@/routes/sale/sii-cafs';

const CAF_STATUS_LABEL: Record<SiiCafStatusValue, string> = {
    active: 'Activo',
    expired: 'Vencido',
    cancelled: 'Cancelado',
};

function cafStatusBadgeClass(status: SiiCafStatusValue): string {
    if (status === 'active') {
        return 'border-emerald-600/40 bg-emerald-600/10 text-emerald-800 dark:text-emerald-200';
    }

    if (status === 'expired') {
        return 'border-red-500/40 bg-red-500/10 text-red-800 dark:text-red-200';
    }

    return 'text-muted-foreground';
}

export default function SiiCafsIndex() {
    const page = usePage<SiiCafsIndexPageProps>();
    const {
        sii_ready,
        data,
        filters,
        document_types,
        folios_for_modal,
        can,
    } = page.props;

    const { deleteRow, deleteConfirmDialog } = useSiiCafsIndex();
    const { formOpen, openCreate, handleFormOpenChange } =
        useEntityFormDialogState<SiiCafRow>();
    const [foliosLocalOpen, setFoliosLocalOpen] = useState(false);

    const foliosDialogOpen = folios_for_modal !== null || foliosLocalOpen;

    const visitListQuery = useCallback(
        (overrides: Record<string, unknown>) => {
            router.get(
                siiCafsIndex.url({
                    query: tabledataListFiltersToQueryWithModuleKeys(
                        SII_CAFS_INDEX_MODULE_FILTER_KEYS,
                        filters as SiiCafListFilters,
                        {
                            ...overrides,
                            page: (overrides.page as number | undefined) ?? data.current_page,
                        },
                    ),
                }),
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                    only: [...SII_CAFS_INDEX_INERTIA_ONLY],
                },
            );
        },
        [filters, data.current_page],
    );

    const openFolios = useCallback(
        (cafId: string) => {
            setFoliosLocalOpen(true);
            visitListQuery({ folios_for: cafId });
        },
        [visitListQuery],
    );

    const handleFoliosOpenChange = useCallback(
        (open: boolean) => {
            if (!open) {
                setFoliosLocalOpen(false);
                visitListQuery({ folios_for: undefined });
            }
        },
        [visitListQuery],
    );

    const columns = useMemo<TabledataColumn<SiiCafRow>[]>(
        () => [
            {
                key: 'status',
                label: 'Estado',
                sortable: true,
                hideable: false,
                headerClassName: 'min-w-[100px]',
                render: (row) => (
                    <Badge
                        variant="outline"
                        className={cafStatusBadgeClass(row.status)}
                    >
                        {CAF_STATUS_LABEL[row.status]}
                    </Badge>
                ),
            },
            {
                key: 'document_type',
                label: 'Tipo de documento',
                sortable: false,
                hideable: false,
                headerClassName: 'min-w-[200px]',
                render: (row) => (
                    <span className="max-w-md truncate">
                        {row.sii_tax_document_type?.name ?? '—'}
                    </span>
                ),
            },
            {
                key: 'folio_from',
                label: 'Rango inicial',
                sortable: true,
                hideable: false,
            },
            {
                key: 'folio_to',
                label: 'Rango final',
                sortable: true,
                hideable: false,
            },
            {
                key: 'folios_used_count',
                label: 'Usados',
                sortable: false,
                hideable: true,
            },
            {
                key: 'last_used_folio',
                label: 'Último usado',
                sortable: false,
                hideable: true,
                render: (row) =>
                    row.last_used_folio != null ? String(row.last_used_folio) : null,
            },
            {
                key: 'uploaded_at',
                label: 'Subido el',
                sortable: true,
                hideable: true,
                render: (row) => (
                    <DateDisplay value={row.uploaded_at} mode="datetime" />
                ),
            },
            {
                key: 'authorized_at',
                label: 'Autorización',
                sortable: true,
                hideable: true,
                render: (row) => <DateDisplay value={row.authorized_at} mode="date" />,
            },
            {
                key: 'expires_at',
                label: 'Vencimiento',
                sortable: true,
                hideable: true,
                render: (row) => <DateDisplay value={row.expires_at} mode="date" />,
            },
            {
                key: 'actions',
                label: '',
                hideable: false,
                headerClassName: 'w-0 text-right',
                render: (row) => (
                    <div className="flex justify-end gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            type="button"
                            title="Ver folios"
                            onClick={() => openFolios(row.id)}
                        >
                            <ListIcon className="size-3" />
                        </Button>
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
        [can.delete, deleteRow, openFolios],
    );

    return (
        <>
            {deleteConfirmDialog}
            <Head title={CONFIG_TABLEDATA.pageTitle} />

            <FormDialog open={formOpen} onOpenChange={handleFormOpenChange} />

            <FoliosDialog
                open={foliosDialogOpen}
                onOpenChange={handleFoliosOpenChange}
                payload={folios_for_modal}
            />

            <div className="flex w-full max-w-8xl flex-col gap-6 p-4 text-left">
                {!sii_ready ? <SiiIntegrationIncompleteAlert /> : null}

                {sii_ready ? (
                    <TabledataProvider<SiiCafRow, SiiCafListFilters, SiiCafsIndexFiltersDraftFull>
                        listConfig={pickTabledataListShellConfig(CONFIG_TABLEDATA)}
                        listInertia={CONFIG_TABLEDATA.listInertia}
                        columns={columns}
                        toolbar={(list) => (
                            <>
                                <SiiCafsIndexFilters
                                    documentTypes={document_types}
                                    filters={list.filters}
                                    setFilter={list.setFilter}
                                    applyFilters={list.applyFilters}
                                    resetFilters={list.resetFilters}
                                />
                                {can.upload ? (
                                    <Button type="button" onClick={openCreate}>
                                        <CirclePlus />
                                        Nuevo
                                    </Button>
                                ) : null}
                            </>
                        )}
                        emptyMessage="No hay SII CAFs registrados para esta empresa."
                        getRowKey={(row) => row.id}
                        density="compact"
                    />
                ) : null}
            </div>
        </>
    );
}

SiiCafsIndex.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.index(),
};
