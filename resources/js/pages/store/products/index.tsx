import { Head, usePage } from '@inertiajs/react';
import { CirclePlus } from 'lucide-react';
import { useMemo } from 'react';
import { formatCurrencyDisplay } from '@/components/custom/currency-display';
import {
    pickTabledataListShellConfig,
    TabledataProvider,
} from '@/components/custom/tabledata';
import type { TabledataColumn } from '@/components/custom/tabledata';
import {
    buildTabledataCrudActionsColumn,
    buildTabledataIsActiveStatusColumn,
} from '@/components/custom/tabledata-crud-actions';
import { Button } from '@/components/ui/button';
import { useEntityFormDialogState } from '@/hooks/use-entity-form-dialog-state';
import { CONFIG_TABLEDATA } from '@/pages/store/products/config';
import type { ProductsIndexPageProps } from '@/pages/store/products/config';
import { ProductsIndexFilters } from '@/pages/store/products/filters';
import { ProductForm } from '@/pages/store/products/form';
import { useProductsIndex } from '@/pages/store/products/hooks/use-index';
import type { Product, ProductListFilters, ProductsIndexFiltersDraftFull } from '@/pages/store/products/types';

function ProductsIndex() {
    const { can, productCategories, productTypes } =
        usePage<ProductsIndexPageProps>().props;
    const { deleteRow } = useProductsIndex();
    const { formOpen, editingEntity, openCreate, openEdit, handleFormOpenChange } =
        useEntityFormDialogState<Product>();

    const columns = useMemo<TabledataColumn<Product>[]>(
        () => [
            {
                key: 'name',
                label: 'Nombre',
                sortable: true,
                hideable: false,
            },
            {
                key: 'product_category',
                label: 'Categoría',
                sortable: false,
                render: (row) => row.product_category?.name ?? '—',
            },
            {
                key: 'product_type',
                label: 'Tipo',
                sortable: false,
                render: (row) => row.product_type?.name ?? '—',
            },
            {
                key: 'price',
                label: 'Precio',
                sortable: true,
                render: (row) => formatCurrencyDisplay(row.price),
            },
            buildTabledataIsActiveStatusColumn<Product>(),
            buildTabledataCrudActionsColumn<Product>({
                can,
                onEdit: openEdit,
                onDelete: deleteRow,
            }),
        ],
        [can, deleteRow, openEdit],
    );

    return (
        <>
            <Head title={CONFIG_TABLEDATA.pageTitle} />

            <ProductForm
                open={formOpen}
                onOpenChange={handleFormOpenChange}
                entity={editingEntity}
                productCategories={productCategories}
                productTypes={productTypes}
            />

            <TabledataProvider<Product, ProductListFilters, ProductsIndexFiltersDraftFull>
                listConfig={pickTabledataListShellConfig(CONFIG_TABLEDATA)}
                listInertia={CONFIG_TABLEDATA.listInertia}
                columns={columns}
                toolbar={(list) => (
                    <>
                        <ProductsIndexFilters
                            filters={list.filters}
                            setFilter={list.setFilter}
                            applyFilters={list.applyFilters}
                            resetFilters={list.resetFilters}
                            productCategories={productCategories}
                            productTypes={productTypes}
                        />
                        {can.create ? (
                            <Button type="button" onClick={openCreate}>
                                <CirclePlus />
                                Nuevo
                            </Button>
                        ) : null}
                    </>
                )}
                emptyMessage="Ningún producto coincide con la búsqueda o los filtros."
                getRowKey={(row) => row.id}
                density="compact"
            />
        </>
    );
}

ProductsIndex.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.index(),
};

export default ProductsIndex;
