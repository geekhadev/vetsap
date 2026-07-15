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
} from '@/lib/store-master-record';
import { CONFIG_TABLEDATA } from '@/pages/store/product-types/config';
import type { ProductTypesIndexPageProps } from '@/pages/store/product-types/config';
import { ProductTypesIndexFilters } from '@/pages/store/product-types/filters';
import { ProductTypeForm } from '@/pages/store/product-types/form';
import { useProductTypesIndex } from '@/pages/store/product-types/hooks/use-index';
import type {
    ProductType,
    ProductTypeListFilters,
    ProductTypesIndexFiltersDraftFull,
} from '@/pages/store/product-types/types';
function ProductTypesIndex({ can }: Pick<ProductTypesIndexPageProps, 'can'>) {
    const { deleteRow } = useProductTypesIndex();
    const { formOpen, editingEntity, openCreate, openEdit, handleFormOpenChange } =
        useEntityFormDialogState<ProductType>();

    const columns = useMemo<TabledataColumn<ProductType>[]>(
        () => [
            {
                key: 'name',
                label: 'Nombre',
                sortable: true,
                hideable: false,
            },
            buildTabledataIsActiveStatusColumn<ProductType>({ gender: 'm' }),
            buildTabledataCrudActionsColumn<ProductType>({
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

            <ProductTypeForm
                open={formOpen}
                onOpenChange={handleFormOpenChange}
                entity={editingEntity}
            />

            <TabledataProvider<
                ProductType,
                ProductTypeListFilters,
                ProductTypesIndexFiltersDraftFull
            >
                listConfig={pickTabledataListShellConfig(CONFIG_TABLEDATA)}
                listInertia={CONFIG_TABLEDATA.listInertia}
                columns={columns}
                toolbar={(list) => (
                    <>
                        <ProductTypesIndexFilters
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
                emptyMessage="Ningún tipo coincide con la búsqueda o los filtros."
                getRowKey={(row) => row.id}
                density="compact"
            />
        </>
    );
}

ProductTypesIndex.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.index(),
};

export default ProductTypesIndex;
