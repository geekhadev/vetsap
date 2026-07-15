import { Head, usePage } from '@inertiajs/react';
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { useMemo } from 'react';
import { DateDisplay } from '@/components/custom/date-display';
import {
    pickTabledataListShellConfig,
    TabledataProvider,
} from '@/components/custom/tabledata';
import type { TabledataColumn } from '@/components/custom/tabledata';
import { Button } from '@/components/ui/button';
import { CONFIG_TABLEDATA } from '@/pages/store/inventory-movements/config';
import type { InventoryMovementsIndexPageProps } from '@/pages/store/inventory-movements/config';
import { InventoryMovementsIndexFilters } from '@/pages/store/inventory-movements/filters';
import { InventoryMovementForm } from '@/pages/store/inventory-movements/form';
import { useInventoryMovementDialogState } from '@/pages/store/inventory-movements/hooks/use-index';
import type {
    InventoryMovement,
    InventoryMovementListFilters,
    InventoryMovementsIndexFiltersDraftFull,
} from '@/pages/store/inventory-movements/types';
import { formatMovementType } from '@/pages/store/inventory-movements/types';

function InventoryMovementsIndex() {
    const { can, movementTypes, movementCategories, products } =
        usePage<InventoryMovementsIndexPageProps>().props;
    const { formOpen, formSessionKey, movementType, openCreate, handleFormOpenChange } =
        useInventoryMovementDialogState();

    const columns = useMemo<TabledataColumn<InventoryMovement>[]>(
        () => [
            {
                key: 'moved_at',
                label: 'Fecha',
                sortable: true,
                hideable: false,
                render: (row) => <DateDisplay value={row.moved_at} mode="date" />,
            },
            {
                key: 'number',
                label: 'Número',
                sortable: true,
                render: (row) => String(row.number).padStart(6, '0'),
            },
            {
                key: 'type',
                label: 'Tipo',
                sortable: true,
                render: (row) => formatMovementType(row.type, movementTypes),
            },
            {
                key: 'movement_category',
                label: 'Categoría',
                sortable: false,
                render: (row) => row.movement_category?.name ?? '—',
            },
        ],
        [movementTypes],
    );

    return (
        <>
            <Head title={CONFIG_TABLEDATA.pageTitle} />

            <InventoryMovementForm
                open={formOpen}
                onOpenChange={handleFormOpenChange}
                type={movementType}
                formSessionKey={formSessionKey}
                movementCategories={movementCategories}
                products={products}
            />

            <TabledataProvider<
                InventoryMovement,
                InventoryMovementListFilters,
                InventoryMovementsIndexFiltersDraftFull
            >
                listConfig={pickTabledataListShellConfig(CONFIG_TABLEDATA)}
                listInertia={CONFIG_TABLEDATA.listInertia}
                columns={columns}
                toolbar={(list) => (
                    <>
                        <InventoryMovementsIndexFilters
                            filters={list.filters}
                            setFilter={list.setFilter}
                            applyFilters={list.applyFilters}
                            resetFilters={list.resetFilters}
                            movementTypes={movementTypes}
                            movementCategories={movementCategories}
                        />
                        {can.create ? (
                            <>
                                <Button
                                    type="button"
                                    onClick={() => openCreate('entry')}
                                >
                                    <ArrowDownToLine />
                                    Entrada
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => openCreate('exit')}
                                >
                                    <ArrowUpFromLine />
                                    Salida
                                </Button>
                            </>
                        ) : null}
                    </>
                )}
                emptyMessage="Ningún movimiento coincide con la búsqueda o los filtros."
                getRowKey={(row) => row.id}
                density="compact"
            />
        </>
    );
}

InventoryMovementsIndex.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.index(),
};

export default InventoryMovementsIndex;
