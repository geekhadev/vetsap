import type { TabledataListStandardDraft } from '@/components/custom/tabledata';
import type { PaginatedListFilters } from '@/types/list-filters';

export type Specialty = {
    id: string;
    company_id: string;
    name: string;
    description: string | null;
    is_active: boolean;
    active_services_count: number;
    created_at: string;
    updated_at: string;
};

export const SPECIALTIES_INDEX_MODULE_FILTER_KEYS = ['is_active'] as const;

export type SpecialtiesIndexModuleFilterKey =
    (typeof SPECIALTIES_INDEX_MODULE_FILTER_KEYS)[number];

export type SpecialtiesIndexModuleFilters = {
    [K in SpecialtiesIndexModuleFilterKey]: string;
};

export type SpecialtyListFilters = PaginatedListFilters & {
    [K in SpecialtiesIndexModuleFilterKey]?: string | null;
};

export type SpecialtiesIndexFiltersDraftFull =
    SpecialtiesIndexModuleFilters & TabledataListStandardDraft;

export type SpecialtiesIndexCan = {
    create: boolean;
    update: boolean;
    delete: boolean;
};

export const IS_ACTIVE_FILTER_OPTIONS = [
    { id: '1', label: 'Activas' },
    { id: '0', label: 'Inactivas' },
] as const;

export function formatIsActive(value: boolean): string {
    return value ? 'Activa' : 'Inactiva';
}
