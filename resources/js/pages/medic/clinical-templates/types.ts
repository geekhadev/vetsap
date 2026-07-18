import type { TabledataListStandardDraft } from '@/components/custom/tabledata';
import { isActiveFilterOptions } from '@/types/active-record';
import type { PaginatedListFilters } from '@/types/list-filters';

// Catálogo de field_key disponibles para armar plantillas.
// Vive en código para mantenerlo controlado.
export const CLINICAL_FIELD_CATALOG = [
    // Signos vitales
    { key: 'temperature',        label: 'Temperatura (°C)',          group: 'Signos vitales', type: 'number' },
    { key: 'heart_rate',         label: 'Frecuencia cardíaca (lpm)', group: 'Signos vitales', type: 'number' },
    { key: 'respiratory_rate',   label: 'Frecuencia respiratoria',   group: 'Signos vitales', type: 'number' },
    { key: 'body_condition',     label: 'Condición corporal (1-9)',   group: 'Signos vitales', type: 'scale_1_9' },
    { key: 'muscle_condition',   label: 'Condición muscular (1-5)',   group: 'Signos vitales', type: 'scale_1_5' },
    { key: 'capillary_refill',   label: 'Relleno capilar',           group: 'Signos vitales', type: 'select',
      options: [
          { id: 'normal', label: 'Normal (< 2 seg)' },
          { id: 'slow',   label: 'Lento (2-4 seg)'  },
          { id: 'fast',   label: 'Rápido (< 1 seg)' },
      ],
    },
    // Datos clínicos
    { key: 'anamnesis',          label: 'Anamnesis',                 group: 'Datos clínicos', type: 'textarea' },
    { key: 'clinical_findings',  label: 'Hallazgos examen clínico',  group: 'Datos clínicos', type: 'textarea' },
    { key: 'pre_diagnosis',      label: 'Pre-diagnóstico',           group: 'Datos clínicos', type: 'textarea' },
    { key: 'diagnosis',          label: 'Diagnóstico',               group: 'Datos clínicos', type: 'textarea' },
    { key: 'treatment',          label: 'Tratamiento',               group: 'Datos clínicos', type: 'textarea' },
    { key: 'prescription',       label: 'Receta',                    group: 'Datos clínicos', type: 'textarea' },
] as const;

export type ClinicalFieldKey = (typeof CLINICAL_FIELD_CATALOG)[number]['key'];

export type ClinicalTemplateField = {
    id: string;
    template_id: string;
    field_key: ClinicalFieldKey;
    label: string;
    field_order: number;
    is_required: boolean;
    is_shared_with_client: boolean;
};

export type ClinicalTemplate = {
    id: string;
    company_id: string;
    name: string;
    description: string | null;
    is_default: boolean;
    is_active: boolean;
    species?: { id: string; name: string }[];
    fields?: ClinicalTemplateField[];
    created_at: string;
    updated_at: string;
};

export type SpeciesOption = {
    id: string;
    name: string;
};

export const CLINICAL_TEMPLATES_MODULE_FILTER_KEYS = ['is_active', 'species_id'] as const;

export type ClinicalTemplatesModuleFilterKey =
    (typeof CLINICAL_TEMPLATES_MODULE_FILTER_KEYS)[number];

export type ClinicalTemplatesModuleFilters = {
    [K in ClinicalTemplatesModuleFilterKey]: string;
};

export type ClinicalTemplateListFilters = PaginatedListFilters & {
    [K in ClinicalTemplatesModuleFilterKey]?: string | null;
};

export type ClinicalTemplatesIndexFiltersDraftFull =
    ClinicalTemplatesModuleFilters & TabledataListStandardDraft;

export type ClinicalTemplatesIndexCan = {
    create: boolean;
    update: boolean;
    delete: boolean;
};

export const IS_ACTIVE_FILTER_OPTIONS = isActiveFilterOptions('f');
