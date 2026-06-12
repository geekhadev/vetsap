import type { TabledataListStandardDraft } from '@/components/custom/tabledata';
import type { ClinicalFieldKey, ClinicalTemplate } from '@/pages/medic/clinical-templates/types';
import type { PaginatedListFilters } from '@/types/list-filters';

export type { ClinicalFieldKey } from '@/pages/medic/clinical-templates/types';

export type AttentionValue = {
    id: string;
    attention_id: string;
    field_key: ClinicalFieldKey;
    value: unknown;
};

export type ClinicalAttention = {
    id: string;
    company_id: string;
    appointment_id: string | null;
    template_id: string;
    patient_id: string;
    doctor_id: string;
    template?: ClinicalTemplate | null;
    patient?: { id: string; name: string; record_number: string } | null;
    doctor?: { id: string; first_name: string; last_name: string } | null;
    values?: AttentionValue[];
    created_at: string;
    updated_at: string;
};

export type PatientOption = {
    id: string;
    name: string;
    record_number: string;
    sex?: 'male' | 'female' | 'unknown' | null;
    weight_kg?: string | null;
    colors?: string | null;
    breed?: string | null;
    species_name?: string | null;
    customer_name?: string | null;
    customer_phone?: string | null;
    customer_email?: string | null;
};

export type DoctorOption = {
    id: string;
    first_name: string;
    last_name: string;
};

export type TemplateOption = {
    id: string;
    name: string;
    is_default: boolean;
    fields: ClinicalTemplate['fields'];
};

export const CLINICAL_ATTENTIONS_MODULE_FILTER_KEYS = ['patient_id', 'doctor_id', 'template_id'] as const;

export type ClinicalAttentionsModuleFilterKey =
    (typeof CLINICAL_ATTENTIONS_MODULE_FILTER_KEYS)[number];

export type ClinicalAttentionsModuleFilters = {
    [K in ClinicalAttentionsModuleFilterKey]: string;
};

export type ClinicalAttentionListFilters = PaginatedListFilters & {
    [K in ClinicalAttentionsModuleFilterKey]?: string | null;
};

export type ClinicalAttentionsIndexFiltersDraftFull =
    ClinicalAttentionsModuleFilters & TabledataListStandardDraft;

export type ClinicalAttentionsIndexCan = {
    create: boolean;
    update: boolean;
    delete: boolean;
};
