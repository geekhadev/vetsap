import { buildTabledataListInertiaForModuleStringKeys } from '@/components/custom/tabledata';
import type { TabledataListQueryValues } from '@/components/custom/tabledata';
import { buildModuleBreadcrumbs } from '@/lib/module-breadcrumbs';
import type {
    ClinicalAttention,
    ClinicalAttentionListFilters,
    ClinicalAttentionsIndexCan,
    ClinicalAttentionsIndexFiltersDraftFull,
    DoctorOption,
    PatientOption,
    TemplateOption,
} from '@/pages/medic/clinical-attentions/types';
import { CLINICAL_ATTENTIONS_MODULE_FILTER_KEYS } from '@/pages/medic/clinical-attentions/types';
import {
    index as clinicalAttentionsIndex,
    create as clinicalAttentionsCreate,
} from '@/routes/medic/clinical-attentions';
import type { BreadcrumbItem } from '@/types/navigation';
import type { Paginated } from '@/types/pagination';

export type ClinicalAttentionsIndexPageProps = {
    data: Paginated<ClinicalAttention>;
    filters: ClinicalAttentionsIndexFiltersDraftFull;
    patients: PatientOption[];
    doctors: DoctorOption[];
    templates: TemplateOption[];
    can: ClinicalAttentionsIndexCan;
};

const PAGE = {
    storageKey: 'clinical-attentions-index',
    title: 'Atenciones clínicas',
    description: 'Registro de atenciones médicas por paciente.',
    searchPlaceholder: 'Paciente o médico…',
} as const;

const ORDER = { sort: 'created_at', direction: 'desc' } as const;

export const CONFIG_TABLEDATA = {
    storageKey: PAGE.storageKey,
    pageTitle: PAGE.title,
    pageDescription: PAGE.description,
    searchPlaceholder: PAGE.searchPlaceholder,
    order: ORDER,
    breadcrumbs: {
        index: (): BreadcrumbItem[] => buildModuleBreadcrumbs(PAGE.title, clinicalAttentionsIndex()),
        create: (): BreadcrumbItem[] =>
            buildModuleBreadcrumbs(PAGE.title, clinicalAttentionsIndex(), {
                title: 'Nueva atención',
                href: clinicalAttentionsCreate(),
            }),
        edit: (): BreadcrumbItem[] =>
            buildModuleBreadcrumbs(PAGE.title, clinicalAttentionsIndex(), {
                title: 'Editar atención',
            }),
    },
    listInertia: buildTabledataListInertiaForModuleStringKeys<
        ClinicalAttention,
        ClinicalAttentionListFilters,
        typeof CLINICAL_ATTENTIONS_MODULE_FILTER_KEYS
    >({
        moduleKeys: CLINICAL_ATTENTIONS_MODULE_FILTER_KEYS,
        indexUrl: (query: TabledataListQueryValues) => clinicalAttentionsIndex.url({ query }),
        moduleResetQuery: { ...ORDER },
    }),
};
