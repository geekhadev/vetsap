import { Head, usePage } from '@inertiajs/react';
import { CirclePlus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { ActiveStatusBadge } from '@/components/custom/active-status-badge';
import {
    pickTabledataListShellConfig,
    TabledataProvider,
} from '@/components/custom/tabledata';
import type { TabledataColumn } from '@/components/custom/tabledata';
import { buildTabledataCrudActionsColumn } from '@/components/custom/tabledata-crud-actions';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useEntityFormDialogState } from '@/hooks/use-entity-form-dialog-state';
import type { PermissionsIndexPageProps } from '@/pages/administration/permissions/config';
import { CONFIG_TABLEDATA } from '@/pages/administration/permissions/config';
import { PermissionsIndexFilters } from '@/pages/administration/permissions/filters';
import { FormDialog } from '@/pages/administration/permissions/form-dialog';
import { usePermissionsIndex } from '@/pages/administration/permissions/hooks/use-index';
import { OwnerAccessDialog } from '@/pages/administration/permissions/owner-access-dialog';
import type {
    Permission,
    PermissionListFilters,
    PermissionsIndexFiltersDraftFull,
} from './types';
import { isPermissionAssignableToOwner } from './types';

function PermissionsIndex() {
    const { systems, modules, data } =
        usePage<PermissionsIndexPageProps>().props;
    const {
        deleteRow,
        deleteConfirmDialog,
        bulkSetOwnerEnabled,
        ownerBulkPending,
    } = usePermissionsIndex();
    const { formOpen, editingEntity, openCreate, openEdit, handleFormOpenChange } =
        useEntityFormDialogState<Permission>();

    const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
    const [ownerDialogOpen, setOwnerDialogOpen] = useState(false);

    const pageRows = data.data;
    const assignablePageIds = useMemo(
        () =>
            pageRows
                .filter((row) => isPermissionAssignableToOwner(row))
                .map((row) => row.id),
        [pageRows],
    );

    const selectedOnPageCount = useMemo(
        () => assignablePageIds.filter((id) => selectedIds.has(id)).length,
        [assignablePageIds, selectedIds],
    );

    const pageSelectState: boolean | 'indeterminate' =
        assignablePageIds.length === 0
            ? false
            : selectedOnPageCount === 0
              ? false
              : selectedOnPageCount === assignablePageIds.length
                ? true
                : 'indeterminate';

    const toggleRow = useCallback((id: string, checked: boolean): void => {
        setSelectedIds((prev) => {
            const next = new Set(prev);

            if (checked) {
                next.add(id);
            } else {
                next.delete(id);
            }

            return next;
        });
    }, []);

    const togglePage = useCallback(
        (checked: boolean): void => {
            setSelectedIds((prev) => {
                const next = new Set(prev);

                for (const id of assignablePageIds) {
                    if (checked) {
                        next.add(id);
                    } else {
                        next.delete(id);
                    }
                }

                return next;
            });
        },
        [assignablePageIds],
    );

    const applyOwnerAccess = useCallback(
        (enabled: boolean): void => {
            bulkSetOwnerEnabled([...selectedIds], enabled, () => {
                setSelectedIds(new Set());
                setOwnerDialogOpen(false);
            });
        },
        [bulkSetOwnerEnabled, selectedIds],
    );

    const columns = useMemo<TabledataColumn<Permission>[]>(
        () => [
            {
                key: '_select',
                label: (
                    <Checkbox
                        checked={pageSelectState}
                        disabled={
                            assignablePageIds.length === 0 || ownerBulkPending
                        }
                        onCheckedChange={(value) => {
                            togglePage(value === true);
                        }}
                        aria-label="Seleccionar permisos de esta página"
                        onClick={(event) => {
                            event.stopPropagation();
                        }}
                    />
                ),
                sortable: false,
                hideable: false,
                className: 'w-10',
                headerClassName: 'w-10',
                render: (row) => {
                    const assignable = isPermissionAssignableToOwner(row);

                    if (!assignable) {
                        return (
                            <span className="text-muted-foreground text-xs">
                                —
                            </span>
                        );
                    }

                    return (
                        <Checkbox
                            checked={selectedIds.has(row.id)}
                            disabled={ownerBulkPending}
                            onCheckedChange={(value) => {
                                toggleRow(row.id, value === true);
                            }}
                            aria-label={`Seleccionar permiso «${row.name}»`}
                            onClick={(event) => {
                                event.stopPropagation();
                            }}
                        />
                    );
                },
            },
            {
                key: 'name',
                label: 'Nombre',
                sortable: true,
                hideable: false,
            },
            {
                key: 'module',
                label: 'Módulo',
                sortable: false,
                hideable: false,
                render: (row) => row.module?.name ?? '—',
            },
            {
                key: 'system',
                label: 'Sistema',
                sortable: false,
                hideable: false,
                render: (row) => row.module?.system?.name ?? '—',
            },
            {
                key: 'slug',
                label: 'Slug',
                sortable: true,
                hideable: false,
            },
            {
                key: 'owner_enabled',
                label: 'Owner',
                sortable: false,
                hideable: false,
                className: 'w-[6rem]',
                render: (row) => {
                    if (!isPermissionAssignableToOwner(row)) {
                        return (
                            <span
                                className="text-muted-foreground text-xs"
                                title="No aplica a Owner (Administración / Compartido)"
                            >
                                —
                            </span>
                        );
                    }

                    return (
                        <ActiveStatusBadge
                            active={Boolean(row.owner_enabled)}
                        />
                    );
                },
            },
            buildTabledataCrudActionsColumn<Permission>({
                onEdit: openEdit,
                onDelete: deleteRow,
            }),
        ],
        [
            assignablePageIds.length,
            deleteRow,
            openEdit,
            ownerBulkPending,
            pageSelectState,
            selectedIds,
            togglePage,
            toggleRow,
        ],
    );

    return (
        <>
            {deleteConfirmDialog}
            <Head title={CONFIG_TABLEDATA.pageTitle} />

            <FormDialog
                open={formOpen}
                onOpenChange={handleFormOpenChange}
                permission={editingEntity}
                systems={systems}
                modules={modules}
            />

            <OwnerAccessDialog
                open={ownerDialogOpen}
                onOpenChange={setOwnerDialogOpen}
                selectedCount={selectedIds.size}
                pending={ownerBulkPending}
                onActivate={() => {
                    applyOwnerAccess(true);
                }}
                onDeactivate={() => {
                    applyOwnerAccess(false);
                }}
            />

            <TabledataProvider<
                Permission,
                PermissionListFilters,
                PermissionsIndexFiltersDraftFull
            >
                listConfig={pickTabledataListShellConfig(CONFIG_TABLEDATA)}
                listInertia={CONFIG_TABLEDATA.listInertia}
                columns={columns}
                toolbar={(list) => (
                    <>
                        <PermissionsIndexFilters
                            filters={list.filters}
                            setFilter={list.setFilter}
                            applyFilters={list.applyFilters}
                            resetFilters={list.resetFilters}
                            systems={systems}
                            modules={modules}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            disabled={
                                selectedIds.size === 0 || ownerBulkPending
                            }
                            onClick={() => {
                                setOwnerDialogOpen(true);
                            }}
                        >
                            Acción Owner
                            {selectedIds.size > 0
                                ? ` (${selectedIds.size})`
                                : ''}
                        </Button>
                        <Button type="button" onClick={openCreate}>
                            <CirclePlus />
                            Nuevo
                        </Button>
                    </>
                )}
                emptyMessage="Ningún permiso coincide con la búsqueda o los filtros."
                getRowKey={(row) => row.id}
                density="compact"
            />
        </>
    );
}

PermissionsIndex.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.index(),
};

export default PermissionsIndex;
