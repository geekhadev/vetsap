import { Head } from '@inertiajs/react';
import { CirclePlus } from 'lucide-react';
import { useMemo } from 'react';
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
import {
    canDeleteStoreMasterRow,
    canModifyStoreMasterRow,
    renderMasterRecordName,
} from '@/lib/store-master-record';
import {
    CONFIG_TABLEDATA,
} from '@/pages/store/product-categories/config';
import type { ProductCategoriesIndexPageProps } from '@/pages/store/product-categories/config';
import { ProductCategoriesIndexFilters } from '@/pages/store/product-categories/filters';
import { ProductCategoryForm } from '@/pages/store/product-categories/form';
import { useProductCategoriesIndex } from '@/pages/store/product-categories/hooks/use-index';
import type {
    ProductCategory,
    ProductCategoryListFilters,
    ProductCategoriesIndexFiltersDraftFull,
} from '@/pages/store/product-categories/types';
function ProductCategoriesIndex({ can }: Pick<ProductCategoriesIndexPageProps, 'can'>) {
    const { deleteRow } = useProductCategoriesIndex();
    const { formOpen, editingEntity, openCreate, openEdit, handleFormOpenChange } =
        useEntityFormDialogState<ProductCategory>();

    const columns = useMemo<TabledataColumn<ProductCategory>[]>(
        () => [
            {
                key: 'name',
                label: 'Nombre',
                sortable: true,
                hideable: false,
                render: (row) => renderMasterRecordName(row.name, row.company_id),
            },
            buildTabledataIsActiveStatusColumn<ProductCategory>(),
            buildTabledataCrudActionsColumn<ProductCategory>({
                onEdit: openEdit,
                onDelete: deleteRow,
                canModifyRow: (row) => canModifyStoreMasterRow(row, can),
                canDeleteRow: (row) => canDeleteStoreMasterRow(row, can),
            }),
        ],
        [can, deleteRow, openEdit],
    );

    return (
        <>
            <Head title={CONFIG_TABLEDATA.pageTitle} />

            <ProductCategoryForm
                open={formOpen}
                onOpenChange={handleFormOpenChange}
                entity={editingEntity}
            />

            <TabledataProvider<
                ProductCategory,
                ProductCategoryListFilters,
                ProductCategoriesIndexFiltersDraftFull
            >
                listConfig={pickTabledataListShellConfig(CONFIG_TABLEDATA)}
                listInertia={CONFIG_TABLEDATA.listInertia}
                columns={columns}
                toolbar={(list) => (
                    <>
                        <ProductCategoriesIndexFilters
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
                emptyMessage="Ninguna categoría coincide con la búsqueda o los filtros."
                getRowKey={(row) => row.id}
                density="compact"
            />
        </>
    );
}

ProductCategoriesIndex.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.index(),
};

export default ProductCategoriesIndex;
