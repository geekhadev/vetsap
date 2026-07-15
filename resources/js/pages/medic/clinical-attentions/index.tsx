import { Head } from '@inertiajs/react';
import { useMemo } from 'react';
import {
    pickTabledataListShellConfig,
    TabledataProvider,
} from '@/components/custom/tabledata';
import type { TabledataColumn } from '@/components/custom/tabledata';
import { buildTabledataCrudActionsColumn } from '@/components/custom/tabledata-crud-actions';
import { CONFIG_TABLEDATA } from '@/pages/medic/clinical-attentions/config';
import type { ClinicalAttentionsIndexPageProps } from '@/pages/medic/clinical-attentions/config';
import { ClinicalAttentionsIndexFilters } from '@/pages/medic/clinical-attentions/filters';
import { useClinicalAttentionsIndex } from '@/pages/medic/clinical-attentions/hooks/use-index';
import type {
    ClinicalAttention,
    ClinicalAttentionListFilters,
    ClinicalAttentionsIndexFiltersDraftFull,
} from '@/pages/medic/clinical-attentions/types';

function ClinicalAttentionsIndex({
    can,
    patients,
    doctors,
    templates,
}: Pick<ClinicalAttentionsIndexPageProps, 'can' | 'patients' | 'doctors' | 'templates'>) {
    const { deleteRow } = useClinicalAttentionsIndex();

    const columns = useMemo<TabledataColumn<ClinicalAttention>[]>(
        () => [
            {
                key: 'patient',
                label: 'Paciente',
                sortable: false,
                hideable: false,
                render: (row) =>
                    row.patient ? (
                        <span className="flex flex-col">
                            <span className="font-medium">{row.patient.name}</span>
                            <span className="text-muted-foreground text-xs">
                                {row.patient.record_number}
                            </span>
                        </span>
                    ) : (
                        '—'
                    ),
            },
            {
                key: 'doctor',
                label: 'Médico',
                sortable: false,
                render: (row) => row.doctor ? `${row.doctor.first_name} ${row.doctor.last_name}` : '—',
            },
            {
                key: 'template',
                label: 'Plantilla',
                sortable: false,
                render: (row) => row.template?.name ?? '—',
            },
            {
                key: 'started_at',
                label: 'Inicio',
                sortable: true,
                render: (row) =>
                    new Date(row.started_at).toLocaleString('es-CL', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
            },
            {
                key: 'closed_at',
                label: 'Fin',
                sortable: true,
                render: (row) =>
                    row.closed_at
                        ? new Date(row.closed_at).toLocaleString('es-CL', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                          })
                        : '—',
            },
            buildTabledataCrudActionsColumn<ClinicalAttention>({
                can: { update: false, delete: can.delete },
                onEdit: () => undefined,
                onDelete: deleteRow,
            }),
        ],
        [can.delete, deleteRow],
    );

    return (
        <>
            <Head title={CONFIG_TABLEDATA.pageTitle} />

            <TabledataProvider<ClinicalAttention, ClinicalAttentionListFilters, ClinicalAttentionsIndexFiltersDraftFull>
                listConfig={pickTabledataListShellConfig(CONFIG_TABLEDATA)}
                listInertia={CONFIG_TABLEDATA.listInertia}
                columns={columns}
                toolbar={(list) => (
                    <ClinicalAttentionsIndexFilters
                        filters={list.filters}
                        setFilter={list.setFilter}
                        applyFilters={list.applyFilters}
                        resetFilters={list.resetFilters}
                        patients={patients}
                        doctors={doctors}
                        templates={templates}
                    />
                )}
                emptyMessage="Ninguna atención coincide con la búsqueda o los filtros."
                getRowKey={(row) => row.id}
                density="compact"
            />
        </>
    );
}

ClinicalAttentionsIndex.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.index(),
};

export default ClinicalAttentionsIndex;
