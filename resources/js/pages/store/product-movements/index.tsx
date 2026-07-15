import { Head, usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import { DateDisplay } from '@/components/custom/date-display';
import { formatNumberDisplay } from '@/components/custom/number-display';
import {
    pickTabledataListShellConfig,
    TabledataProvider,
} from '@/components/custom/tabledata';
import type { TabledataColumn } from '@/components/custom/tabledata';
import { cn } from '@/lib/utils';
import { CONFIG_TABLEDATA } from '@/pages/store/product-movements/config';
import type { ProductMovementsIndexPageProps } from '@/pages/store/product-movements/config';
import { ProductMovementsIndexFilters } from '@/pages/store/product-movements/filters';
import type {
    ProductMovement,
    ProductMovementListFilters,
    ProductMovementsIndexFiltersDraftFull,
} from '@/pages/store/product-movements/types';
import { formatMovementType } from '@/pages/store/product-movements/types';

function ProductMovementsIndex() {
    const { movementTypes, products } =
        usePage<ProductMovementsIndexPageProps>().props;

    const columns = useMemo<TabledataColumn<ProductMovement>[]>(
        () => [
            {
                key: 'moved_at',
                label: 'Fecha',
                sortable: true,
                hideable: false,
                render: (row) => (
                    <DateDisplay
                        value={row.inventory_movement?.moved_at}
                        mode="date"
                    />
                ),
            },
            {
                key: 'number',
                label: 'Número',
                sortable: true,
                render: (row) =>
                    String(row.inventory_movement?.number ?? 0).padStart(6, '0'),
            },
            {
                key: 'type',
                label: 'Tipo',
                sortable: false,
                render: (row) =>
                    row.inventory_movement
                        ? formatMovementType(
                              row.inventory_movement.type,
                              movementTypes,
                          )
                        : '—',
            },
            {
                key: 'movement_category',
                label: 'Categoría',
                sortable: false,
                render: (row) =>
                    row.inventory_movement?.movement_category?.name ?? '—',
            },
            {
                key: 'product',
                label: 'Producto',
                sortable: false,
                render: (row) => row.product?.name ?? '—',
            },
            {
                key: 'quantity',
                label: 'Cantidad',
                sortable: true,
                render: (row) => {
                    const isEntry = row.inventory_movement?.type === 'entry';

                    return (
                        <span
                            className={cn(
                                'font-currency tabular-nums',
                                isEntry
                                    ? 'text-emerald-700 dark:text-emerald-400'
                                    : 'text-destructive',
                            )}
                        >
                            {isEntry ? '+' : '−'}
                            {formatNumberDisplay(row.quantity)}
                        </span>
                    );
                },
            },
        ],
        [movementTypes],
    );

    return (
        <>
            <Head title={CONFIG_TABLEDATA.pageTitle} />

            <TabledataProvider<
                ProductMovement,
                ProductMovementListFilters,
                ProductMovementsIndexFiltersDraftFull
            >
                listConfig={pickTabledataListShellConfig(CONFIG_TABLEDATA)}
                listInertia={CONFIG_TABLEDATA.listInertia}
                columns={columns}
                toolbar={(list) => (
                    <ProductMovementsIndexFilters
                        filters={list.filters}
                        setFilter={list.setFilter}
                        applyFilters={list.applyFilters}
                        resetFilters={list.resetFilters}
                        movementTypes={movementTypes}
                        products={products}
                    />
                )}
                emptyMessage="Ningún movimiento de producto coincide con la búsqueda o los filtros."
                getRowKey={(row) => row.id}
                density="compact"
            />
        </>
    );
}

ProductMovementsIndex.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.index(),
};

export default ProductMovementsIndex;
