import { Head, usePage } from '@inertiajs/react';
import { CirclePlus, PawPrint, PencilIcon, TrashIcon, UserRound } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DocumentBadge } from '@/components/custom/document-badge';
import {
    pickTabledataListShellConfig,
    TabledataProvider,
} from '@/components/custom/tabledata';
import type { TabledataColumn } from '@/components/custom/tabledata';
import { buildTabledataConfiguredStatusColumn } from '@/components/custom/tabledata-crud-actions';
import { Button } from '@/components/ui/button';
import { useEntityFormDialogState } from '@/hooks/use-entity-form-dialog-state';
import { setCustomerFormPosContext } from '@/lib/pos-route-customer';
import { hasCustomerPatientsConfigured } from '@/pages/medic/patients/types';
import { CONFIG_TABLEDATA } from '@/pages/sale/customers/config';
import type { CustomersIndexPageProps } from '@/pages/sale/customers/config';
import { CustomerPatientsForm } from '@/pages/sale/customers/customer-patients-form';
import { CustomerPortalUserForm } from '@/pages/sale/customers/customer-portal-user-form';
import { CustomersIndexFilters } from '@/pages/sale/customers/filters';
import { CustomerForm } from '@/pages/sale/customers/form';
import { useCustomersIndex } from '@/pages/sale/customers/hooks/use-index';
import {
    hasCustomerPortalUserConfigured,
} from '@/pages/sale/customers/types';
import type {
    Customer,
    CustomerListFilters,
    CustomersIndexFiltersDraftFull,
} from '@/pages/sale/customers/types';

function CustomersIndex() {
    const { can, species, data: customersPage } =
        usePage<CustomersIndexPageProps>().props;
    const { deleteRow, deleteConfirmDialog } = useCustomersIndex();
    const { formOpen, editingEntity, openCreate, openEdit, handleFormOpenChange } =
        useEntityFormDialogState<Customer>();
    const [patientsCustomerId, setPatientsCustomerId] = useState<string | null>(
        null,
    );
    const [patientsFormOpen, setPatientsFormOpen] = useState(false);
    const [portalUserCustomerId, setPortalUserCustomerId] = useState<
        string | null
    >(null);
    const [portalUserFormOpen, setPortalUserFormOpen] = useState(false);

    const patientsCustomer = useMemo(() => {
        if (patientsCustomerId === null) {
            return null;
        }

        return (
            customersPage.data.find((row) => row.id === patientsCustomerId) ??
            null
        );
    }, [customersPage.data, patientsCustomerId]);

    const portalUserCustomer = useMemo(() => {
        if (portalUserCustomerId === null) {
            return null;
        }

        return (
            customersPage.data.find((row) => row.id === portalUserCustomerId) ??
            null
        );
    }, [customersPage.data, portalUserCustomerId]);

    useEffect(() => {
        if (formOpen && editingEntity) {
            setCustomerFormPosContext(editingEntity.id);

            return;
        }

        if (patientsFormOpen && patientsCustomer) {
            setCustomerFormPosContext(patientsCustomer.id);

            return;
        }

        setCustomerFormPosContext(null);
    }, [editingEntity, formOpen, patientsCustomer, patientsFormOpen]);

    useEffect(() => {
        return () => {
            setCustomerFormPosContext(null);
        };
    }, []);

    const openPatients = useCallback((row: Customer) => {
        setPatientsCustomerId(row.id);
        setPatientsFormOpen(true);
    }, []);

    const handlePatientsFormOpenChange = useCallback((open: boolean) => {
        setPatientsFormOpen(open);

        if (!open) {
            setPatientsCustomerId(null);
        }
    }, []);

    const openPortalUser = useCallback((row: Customer) => {
        setPortalUserCustomerId(row.id);
        setPortalUserFormOpen(true);
    }, []);

    const handlePortalUserFormOpenChange = useCallback((open: boolean) => {
        setPortalUserFormOpen(open);

        if (!open) {
            setPortalUserCustomerId(null);
        }
    }, []);

    const columns = useMemo<TabledataColumn<Customer>[]>(
        () => [
            {
                key: 'name',
                label: 'Nombre',
                sortable: true,
                hideable: false,
            },
            {
                key: 'document_number',
                label: 'Documento',
                sortable: true,
                render: (row) => (
                    <DocumentBadge
                        documentType={row.document_type}
                        documentNumber={row.document_number}
                    />
                ),
            },
            {
                key: 'email',
                label: 'Email',
                sortable: true,
                render: (row) => row.email ?? '—',
            },
            {
                key: 'phone',
                label: 'Teléfono',
                sortable: false,
                render: (row) => row.phone ?? '—',
            },
            buildTabledataConfiguredStatusColumn<Customer>({
                key: 'patients_status',
                label: 'Pacientes',
                isConfigured: hasCustomerPatientsConfigured,
                icon: PawPrint,
            }),
            buildTabledataConfiguredStatusColumn<Customer>({
                key: 'portal_user_status',
                label: 'Usuario',
                isConfigured: hasCustomerPortalUserConfigured,
                icon: UserRound,
            }),
            {
                key: 'actions',
                label: '',
                sortable: false,
                hideable: false,
                headerClassName: 'w-0 text-right',
                render: (row) => {
                    const patientsConfigured = hasCustomerPatientsConfigured(row);
                    const portalUserConfigured =
                        hasCustomerPortalUserConfigured(row);

                    return (
                        <div className="flex justify-end gap-1">
                            {can.patients.update ? (
                                <Button
                                    variant={
                                        patientsConfigured
                                            ? 'outline'
                                            : 'destructive'
                                    }
                                    size="icon"
                                    type="button"
                                    title={
                                        patientsConfigured
                                            ? 'Gestionar pacientes'
                                            : 'Sin pacientes registrados'
                                    }
                                    onClick={() => openPatients(row)}
                                >
                                    <PawPrint className="size-3" />
                                </Button>
                            ) : null}
                            {can.update ? (
                                <Button
                                    variant={
                                        portalUserConfigured
                                            ? 'outline'
                                            : 'destructive'
                                    }
                                    size="icon"
                                    type="button"
                                    title={
                                        portalUserConfigured
                                            ? 'Configurar usuario del portal'
                                            : 'Sin usuario del portal'
                                    }
                                    onClick={() => openPortalUser(row)}
                                >
                                    <UserRound className="size-3" />
                                </Button>
                            ) : null}
                            {can.update ? (
                                <Button
                                    variant="outline"
                                    size="icon"
                                    type="button"
                                    title="Editar cliente"
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
                                    title="Eliminar"
                                    onClick={() => deleteRow(row)}
                                >
                                    <TrashIcon className="size-3" />
                                </Button>
                            ) : null}
                        </div>
                    );
                },
            },
        ],
        [
            can.delete,
            can.patients.update,
            can.update,
            deleteRow,
            openEdit,
            openPatients,
            openPortalUser,
        ],
    );

    return (
        <>
            {deleteConfirmDialog}
            <Head title={CONFIG_TABLEDATA.pageTitle} />

            <CustomerForm
                open={formOpen}
                onOpenChange={handleFormOpenChange}
                entity={editingEntity}
            />

            <CustomerPatientsForm
                open={patientsFormOpen}
                onOpenChange={handlePatientsFormOpenChange}
                customer={patientsCustomer}
                speciesOptions={species}
                can={can.patients}
            />

            <CustomerPortalUserForm
                open={portalUserFormOpen}
                onOpenChange={handlePortalUserFormOpenChange}
                customer={portalUserCustomer}
            />

            <TabledataProvider<
                Customer,
                CustomerListFilters,
                CustomersIndexFiltersDraftFull
            >
                listConfig={pickTabledataListShellConfig(CONFIG_TABLEDATA)}
                listInertia={CONFIG_TABLEDATA.listInertia}
                columns={columns}
                toolbar={(list) => (
                    <>
                        <CustomersIndexFilters
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
                emptyMessage="Ningún cliente coincide con la búsqueda o los filtros."
                getRowKey={(row) => row.id}
                density="compact"
            />
        </>
    );
}

CustomersIndex.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.index(),
};

export default CustomersIndex;
