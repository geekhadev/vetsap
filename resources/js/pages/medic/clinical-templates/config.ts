import { buildTabledataListInertiaForModuleStringKeys } from '@/components/custom/tabledata';
import type { TabledataListQueryValues } from '@/components/custom/tabledata';
import { buildModuleBreadcrumbs } from '@/lib/module-breadcrumbs';
import type {
    ClinicalTemplate,
    ClinicalTemplateListFilters,
    ClinicalTemplatesIndexCan,
    ClinicalTemplatesIndexFiltersDraftFull,
    SpeciesOption,
} from '@/pages/medic/clinical-templates/types';
import { CLINICAL_TEMPLATES_MODULE_FILTER_KEYS } from '@/pages/medic/clinical-templates/types';
import {
    index as clinicalTemplatesIndex,
    create as clinicalTemplatesCreate,
} from '@/routes/medic/clinical-templates';
import type { BreadcrumbItem } from '@/types/navigation';
import type { Paginated } from '@/types/pagination';

export type ClinicalTemplatesIndexPageProps = {
    data: Paginated<ClinicalTemplate>;
    filters: ClinicalTemplatesIndexFiltersDraftFull;
    species: SpeciesOption[];
    can: ClinicalTemplatesIndexCan;
};

const PAGE = {
    storageKey: 'clinical-templates-index',
    title: 'Fichas médicas',
    description: 'Plantillas configurables que definen los campos de cada atención clínica.',
    searchPlaceholder: 'Nombre de la plantilla…',
} as const;

const ORDER = { sort: 'name', direction: 'asc' } as const;

export const CONFIG_TABLEDATA = {
    storageKey: PAGE.storageKey,
    pageTitle: PAGE.title,
    pageDescription: PAGE.description,
    searchPlaceholder: PAGE.searchPlaceholder,
    order: ORDER,
    breadcrumbs: {
        index: (): BreadcrumbItem[] => buildModuleBreadcrumbs(PAGE.title, clinicalTemplatesIndex()),
        create: (): BreadcrumbItem[] =>
            buildModuleBreadcrumbs(PAGE.title, clinicalTemplatesIndex(), {
                title: 'Nueva plantilla',
                href: clinicalTemplatesCreate(),
            }),
        edit: (): BreadcrumbItem[] =>
            buildModuleBreadcrumbs(PAGE.title, clinicalTemplatesIndex(), {
                title: 'Editar plantilla',
            }),
    },
    listInertia: buildTabledataListInertiaForModuleStringKeys<
        ClinicalTemplate,
        ClinicalTemplateListFilters,
        typeof CLINICAL_TEMPLATES_MODULE_FILTER_KEYS
    >({
        moduleKeys: CLINICAL_TEMPLATES_MODULE_FILTER_KEYS,
        indexUrl: (query: TabledataListQueryValues) => clinicalTemplatesIndex.url({ query }),
        moduleResetQuery: { ...ORDER },
    }),
};
