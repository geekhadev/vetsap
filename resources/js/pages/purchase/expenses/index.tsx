import { Head, usePage } from '@inertiajs/react';
import { CirclePlus, PencilIcon, TrashIcon } from 'lucide-react';
import { useMemo } from 'react';
import { CurrencyDisplay } from '@/components/custom/currency-display';
import { DateDisplay } from '@/components/custom/date-display';
import {
    pickTabledataListShellConfig,
    TabledataProvider,
} from '@/components/custom/tabledata';
import type { TabledataColumn } from '@/components/custom/tabledata';
import { Button } from '@/components/ui/button';
import { useEntityFormDialogState } from '@/hooks/use-entity-form-dialog-state';
import { CONFIG_TABLEDATA } from '@/pages/purchase/expenses/config';
import type { ExpensesIndexPageProps } from '@/pages/purchase/expenses/config';
import { ExpensesIndexFilters } from '@/pages/purchase/expenses/filters';
import { ExpenseForm } from '@/pages/purchase/expenses/form';
import { useExpensesIndex } from '@/pages/purchase/expenses/hooks/use-index';
import type {
    Expense,
    ExpenseListFilters,
    ExpensesIndexFiltersDraftFull,
} from '@/pages/purchase/expenses/types';

function ExpensesIndex() {
    const { can, expenseTypes } = usePage<ExpensesIndexPageProps>().props;
    const { deleteRow, deleteConfirmDialog } = useExpensesIndex();
    const { formOpen, editingEntity, openCreate, openEdit, handleFormOpenChange } =
        useEntityFormDialogState<Expense>();

    const columns = useMemo<TabledataColumn<Expense>[]>(
        () => [
            {
                key: 'spent_at',
                label: 'Fecha',
                sortable: true,
                hideable: false,
                render: (row) => <DateDisplay value={row.spent_at} mode="date" />,
            },
            {
                key: 'expense_type',
                label: 'Tipo de gasto',
                sortable: false,
                render: (row) =>
                    row.expense_type
                        ? `${row.expense_type.name} (${row.expense_type.abbreviation})`
                        : '—',
            },
            {
                key: 'amount',
                label: 'Monto',
                sortable: true,
                render: (row) => <CurrencyDisplay value={row.amount} />,
            },
            {
                key: 'reason',
                label: 'Motivo',
                sortable: true,
                render: (row) => row.reason,
            },
            {
                key: 'actions',
                label: '',
                sortable: false,
                hideable: false,
                headerClassName: 'w-0 text-right',
                render: (row) => (
                    <div className="flex justify-end gap-1">
                        {can.update ? (
                            <Button
                                variant="outline"
                                size="icon"
                                type="button"
                                title="Editar gasto"
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
                ),
            },
        ],
        [can.delete, can.update, deleteRow, openEdit],
    );

    return (
        <>
            {deleteConfirmDialog}
            <Head title={CONFIG_TABLEDATA.pageTitle} />

            <ExpenseForm
                open={formOpen}
                onOpenChange={handleFormOpenChange}
                entity={editingEntity}
                expenseTypes={expenseTypes}
            />

            <TabledataProvider<Expense, ExpenseListFilters, ExpensesIndexFiltersDraftFull>
                listConfig={pickTabledataListShellConfig(CONFIG_TABLEDATA)}
                listInertia={CONFIG_TABLEDATA.listInertia}
                columns={columns}
                toolbar={(list) => (
                    <>
                        <ExpensesIndexFilters
                            filters={list.filters}
                            setFilter={list.setFilter}
                            applyFilters={list.applyFilters}
                            resetFilters={list.resetFilters}
                            expenseTypes={expenseTypes}
                        />
                        {can.create ? (
                            <Button type="button" onClick={openCreate}>
                                <CirclePlus />
                                Nuevo
                            </Button>
                        ) : null}
                    </>
                )}
                emptyMessage="Ningún gasto coincide con la búsqueda o los filtros."
                getRowKey={(row) => row.id}
                density="compact"
            />
        </>
    );
}

ExpensesIndex.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.index(),
};

export default ExpensesIndex;
