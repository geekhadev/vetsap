import { Head, router } from '@inertiajs/react';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CONFIG_TABLEDATA } from '@/pages/medic/clinical-templates/config';
import type { ClinicalTemplatesIndexPageProps } from '@/pages/medic/clinical-templates/config';
import { ClinicalTemplatesIndexFilters } from '@/pages/medic/clinical-templates/filters';
import { useClinicalTemplatesIndex } from '@/pages/medic/clinical-templates/hooks/use-index';
import type {
    ClinicalTemplate,
    ClinicalTemplateListFilters,
    ClinicalTemplatesIndexFiltersDraftFull,
} from '@/pages/medic/clinical-templates/types';
import {
    create as clinicalTemplatesCreate,
    edit as clinicalTemplatesEdit,
} from '@/routes/medic/clinical-templates';

function ClinicalTemplatesIndex({
    can,
    species,
}: Pick<ClinicalTemplatesIndexPageProps, 'can' | 'species'>) {
    const { deleteRow } = useClinicalTemplatesIndex();

    const columns = useMemo<TabledataColumn<ClinicalTemplate>[]>(
        () => [
            {
                key: 'name',
                label: 'Nombre',
                sortable: true,
                hideable: false,
                render: (row) => (
                    <span className="flex items-center gap-2">
                        {row.name}
                        {row.is_default && (
                            <Badge variant="secondary" className="text-xs">
                                Por defecto
                            </Badge>
                        )}
                    </span>
                ),
            },
            {
                key: 'species',
                label: 'Especies',
                sortable: false,
                render: (row) => {
                    const names = row.species?.map((item) => item.name) ?? [];

                    if (names.length === 0) {
                        return (
                            <span className="text-muted-foreground">Todas</span>
                        );
                    }

                    return names.join(', ');
                },
            },
            {
                key: 'fields_count',
                label: 'Campos',
                sortable: false,
                render: (row) => {
                    const count = row.fields?.length ?? 0;

                    return `${count} ${count === 1 ? 'campo' : 'campos'}`;
                },
            },
            buildTabledataIsActiveStatusColumn<ClinicalTemplate>({ gender: 'f' }),
            buildTabledataCrudActionsColumn<ClinicalTemplate>({
                can,
                onEdit: (row) =>
                    router.visit(clinicalTemplatesEdit.url({ clinical_template: row.id })),
                onDelete: deleteRow,
            }),
        ],
        [can, deleteRow],
    );

    return (
        <>
            <Head title={CONFIG_TABLEDATA.pageTitle} />

            <TabledataProvider<ClinicalTemplate, ClinicalTemplateListFilters, ClinicalTemplatesIndexFiltersDraftFull>
                listConfig={pickTabledataListShellConfig(CONFIG_TABLEDATA)}
                listInertia={CONFIG_TABLEDATA.listInertia}
                columns={columns}
                toolbar={(list) => (
                    <>
                        <ClinicalTemplatesIndexFilters
                            filters={list.filters}
                            setFilter={list.setFilter}
                            applyFilters={list.applyFilters}
                            resetFilters={list.resetFilters}
                            species={species}
                        />
                        {can.create ? (
                            <Button
                                type="button"
                                onClick={() => router.visit(clinicalTemplatesCreate.url())}
                            >
                                <CirclePlus />
                                Nueva plantilla
                            </Button>
                        ) : null}
                    </>
                )}
                emptyMessage="Ninguna plantilla coincide con la búsqueda o los filtros."
                getRowKey={(row) => row.id}
            />
        </>
    );
}

ClinicalTemplatesIndex.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.index(),
};

export default ClinicalTemplatesIndex;
