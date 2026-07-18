import { Head, usePage } from '@inertiajs/react';
import { CirclePlus } from 'lucide-react';
import { useMemo } from 'react';
import {
    pickTabledataListShellConfig,
    TabledataProvider,
} from '@/components/custom/tabledata';
import type { TabledataColumn } from '@/components/custom/tabledata';
import { buildTabledataCrudActionsColumn } from '@/components/custom/tabledata-crud-actions';
import { Button } from '@/components/ui/button';
import { useEntityFormDialogState } from '@/hooks/use-entity-form-dialog-state';
import { CONFIG_TABLEDATA } from '@/pages/medic/document-templates/config';
import type { DocumentTemplatesIndexPageProps } from '@/pages/medic/document-templates/config';
import { FormDialog } from '@/pages/medic/document-templates/form-dialog';
import { useDocumentTemplatesIndex } from '@/pages/medic/document-templates/hooks/use-index';
import type {
    DocumentTemplate,
    DocumentTemplateListFilters,
    DocumentTemplatesIndexFiltersDraftFull,
} from '@/pages/medic/document-templates/types';

function DocumentTemplatesIndex() {
    const { can, variables } =
        usePage<DocumentTemplatesIndexPageProps>().props;
    const { deleteRow, deleteConfirmDialog } = useDocumentTemplatesIndex();
    const { formOpen, editingEntity, openCreate, openEdit, handleFormOpenChange } =
        useEntityFormDialogState<DocumentTemplate>();

    const columns = useMemo<TabledataColumn<DocumentTemplate>[]>(
        () => [
            {
                key: 'title',
                label: 'Título',
                sortable: true,
                hideable: false,
            },
            {
                key: 'updated_at',
                label: 'Actualizado',
                sortable: true,
                render: (row) =>
                    new Date(row.updated_at).toLocaleString('es-CL', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                    }),
            },
            buildTabledataCrudActionsColumn<DocumentTemplate>({
                onEdit: openEdit,
                onDelete: deleteRow,
                can: {
                    update: can.update,
                    delete: can.delete,
                },
            }),
        ],
        [can.delete, can.update, deleteRow, openEdit],
    );

    return (
        <>
            {deleteConfirmDialog}
            <Head title={CONFIG_TABLEDATA.pageTitle} />

            <FormDialog
                open={formOpen}
                onOpenChange={handleFormOpenChange}
                entity={editingEntity}
                variables={variables}
            />

            <TabledataProvider<
                DocumentTemplate,
                DocumentTemplateListFilters,
                DocumentTemplatesIndexFiltersDraftFull
            >
                listConfig={pickTabledataListShellConfig(CONFIG_TABLEDATA)}
                listInertia={CONFIG_TABLEDATA.listInertia}
                columns={columns}
                toolbar={
                    can.create ? (
                        <Button type="button" onClick={openCreate}>
                            <CirclePlus />
                            Nuevo
                        </Button>
                    ) : undefined
                }
                emptyMessage="Ninguna plantilla coincide con la búsqueda."
                getRowKey={(row) => row.id}
                density="compact"
            />
        </>
    );
}

DocumentTemplatesIndex.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.index(),
};

export default DocumentTemplatesIndex;
