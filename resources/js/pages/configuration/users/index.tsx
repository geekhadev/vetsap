import { Head, usePage } from '@inertiajs/react';
import { CirclePlus, Pencil, Trash2, UserCog } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import {
    pickTabledataListShellConfig,
    TabledataProvider,
} from '@/components/custom/tabledata';
import type { TabledataColumn } from '@/components/custom/tabledata';
import { Button } from '@/components/ui/button';
import { useEntityFormDialogState } from '@/hooks/use-entity-form-dialog-state';
import { formatUserType } from '@/lib/format-user-type';
import { CompanyRolesDialog } from '@/pages/configuration/users/company-roles-dialog';
import type { UsersIndexPageProps } from '@/pages/configuration/users/config';
import { CONFIG_TABLEDATA } from '@/pages/configuration/users/config';
import { UsersIndexFilters } from '@/pages/configuration/users/filters';
import { FormDialog } from '@/pages/configuration/users/form-dialog';
import { useUsersIndex } from '@/pages/configuration/users/hooks/use-index';
import type {
    UserListRow,
    UserListRowRoot,
    UserListFilters,
    UsersIndexFiltersDraftFull,
} from './types';

type UsersIndexPage = UsersIndexPageProps & {
    company_selected?: { id: string; name?: string } | null;
    auth?: { user?: { id: string } | null };
};

function isRootRow(row: UserListRow): row is UserListRowRoot {
    return 'type' in row && 'created_at' in row;
}

function UsersIndex() {
    const page = usePage<UsersIndexPage>().props;
    const { listMode, companies } = page;
    const sessionCompany = page.company_selected ?? null;
    const currentUserId = page.auth?.user?.id ?? null;
    const { deleteRow } = useUsersIndex();
    const { formOpen, editingEntity, openCreate, openEdit, handleFormOpenChange } =
        useEntityFormDialogState<UserListRow>();
    const [rolesOpen, setRolesOpen] = useState(false);
    const [rolesUser, setRolesUser] = useState<UserListRow | null>(null);

    const openRoles = useCallback((row: UserListRow) => {
        setRolesUser(row);
        setRolesOpen(true);
    }, []);

    const handleRolesOpenChange = useCallback((open: boolean) => {
        setRolesOpen(open);

        if (!open) {
            setRolesUser(null);
        }
    }, []);

    const columns = useMemo<TabledataColumn<UserListRow>[]>(() => {
        const actionsColumn: TabledataColumn<UserListRow> = {
            key: 'actions',
            label: 'Acciones',
            hideable: false,
            headerClassName: 'w-0 text-right',
            render: (row) => {
                const hideRootOnlyActions =
                    isRootRow(row) && row.type === 'root';
                const hideDelete =
                    hideRootOnlyActions || row.id === currentUserId;

                return (
                    <div className="flex justify-end gap-1">
                        {!hideRootOnlyActions ? (
                            <>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    type="button"
                                    onClick={() => openRoles(row)}
                                    aria-label="Empresa y roles"
                                >
                                    <UserCog className="size-3" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    type="button"
                                    onClick={() => openEdit(row)}
                                    aria-label="Editar usuario"
                                >
                                    <Pencil className="size-3" />
                                </Button>
                            </>
                        ) : null}
                        {!hideDelete ? (
                            <Button
                                variant="outline"
                                size="icon"
                                type="button"
                                className="text-destructive hover:text-destructive"
                                onClick={() => deleteRow(row)}
                                aria-label="Eliminar usuario"
                            >
                                <Trash2 className="size-3" />
                            </Button>
                        ) : null}
                    </div>
                );
            },
        };

        if (listMode === 'owner') {
            return [
                {
                    key: 'name',
                    label: 'Nombre',
                    sortable: true,
                    hideable: false,
                },
                {
                    key: 'email',
                    label: 'Correo',
                    sortable: true,
                    hideable: false,
                },
                {
                    key: 'roles',
                    label: 'Roles',
                    sortable: false,
                    hideable: false,
                    render: (row) =>
                        'roles' in row && row.roles.length > 0
                            ? row.roles.join(', ')
                            : '—',
                },
                actionsColumn,
            ];
        }

        return [
            {
                key: 'name',
                label: 'Nombre',
                sortable: true,
                hideable: false,
            },
            {
                key: 'email',
                label: 'Correo',
                sortable: true,
                hideable: false,
            },
            {
                key: 'type',
                label: 'Tipo',
                sortable: true,
                hideable: false,
                render: (row) =>
                    isRootRow(row) ? formatUserType(row.type) : '—',
            },
            actionsColumn,
        ];
    }, [currentUserId, deleteRow, listMode, openEdit, openRoles]);

    const emptyMessage =
        listMode === 'root'
            ? 'Ningún usuario coincide con la búsqueda o los filtros.'
            : 'No hay usuarios en esta empresa para los criterios indicados.';

    return (
        <>
            <Head title={CONFIG_TABLEDATA.pageTitle} />

            <FormDialog
                open={formOpen}
                onOpenChange={handleFormOpenChange}
                editingUser={editingEntity}
            />

            <CompanyRolesDialog
                open={rolesOpen}
                onOpenChange={handleRolesOpenChange}
                user={rolesUser}
                listMode={listMode}
                companies={companies}
                sessionCompanyId={sessionCompany?.id ?? null}
                sessionCompanyName={sessionCompany?.name ?? null}
            />

            <TabledataProvider<UserListRow, UserListFilters, UsersIndexFiltersDraftFull>
                listConfig={pickTabledataListShellConfig(CONFIG_TABLEDATA)}
                listInertia={CONFIG_TABLEDATA.listInertia}
                columns={columns}
                toolbar={
                    listMode === 'root'
                        ? (list) => (
                            <>
                                <UsersIndexFilters
                                    filters={list.filters}
                                    setFilter={list.setFilter}
                                    applyFilters={list.applyFilters}
                                    resetFilters={list.resetFilters}
                                    companies={companies}
                                />
                                <Button type="button" onClick={openCreate}>
                                    <CirclePlus />
                                    Nuevo
                                </Button>
                            </>
                        )
                        : undefined
                }
                emptyMessage={emptyMessage}
                getRowKey={(row) => row.id}
                density="compact"
            />
        </>
    );
}

UsersIndex.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.index(),
};

export default UsersIndex;
