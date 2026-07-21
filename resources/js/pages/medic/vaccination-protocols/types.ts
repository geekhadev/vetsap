import type { TabledataListStandardDraft } from '@/components/custom/tabledata';
import {
    formatIsActive as formatIsActiveBase,
    isActiveFilterOptions,
} from '@/types/active-record';
import type { PaginatedListFilters } from '@/types/list-filters';

export type VaccinationScheduleType =
    | 'from_birth_weeks'
    | 'unique'
    | 'periodic';

export type VaccinationProtocolItem = {
    id?: string;
    product_id: string;
    product?: { id: string; name: string } | null;
    schedule_type: VaccinationScheduleType;
    week_number: number | null;
    min_age_weeks: number | null;
    max_age_weeks: number | null;
    interval_months: number | null;
    series_key: string | null;
    sort_order: number;
};

export type VaccinationProtocol = {
    id: string;
    company_id: string;
    species_id: string;
    name: string;
    description: string | null;
    version: number;
    is_active: boolean;
    items_count?: number;
    species?: { id: string; name: string } | null;
    items?: VaccinationProtocolItem[];
    created_at: string;
    updated_at: string;
};

export type SpeciesOption = {
    id: string;
    name: string;
};

export type VaccineProductOption = {
    id: string;
    name: string;
};

export const VACCINATION_SCHEDULE_TYPE_OPTIONS = [
    { id: 'from_birth_weeks', label: 'Semanas desde nacimiento' },
    { id: 'unique', label: 'Única' },
    { id: 'periodic', label: 'Periódica (meses)' },
] as const satisfies ReadonlyArray<{
    id: VaccinationScheduleType;
    label: string;
}>;

export function formatScheduleType(value: VaccinationScheduleType): string {
    return (
        VACCINATION_SCHEDULE_TYPE_OPTIONS.find((option) => option.id === value)
            ?.label ?? value
    );
}

export const VACCINATION_PROTOCOLS_INDEX_MODULE_FILTER_KEYS = [
    'is_active',
    'species_id',
] as const;

export type VaccinationProtocolsIndexModuleFilterKey =
    (typeof VACCINATION_PROTOCOLS_INDEX_MODULE_FILTER_KEYS)[number];

export type VaccinationProtocolsIndexModuleFilters = {
    [K in VaccinationProtocolsIndexModuleFilterKey]: string;
};

export type VaccinationProtocolListFilters = PaginatedListFilters & {
    [K in VaccinationProtocolsIndexModuleFilterKey]?: string | null;
};

export type VaccinationProtocolsIndexFiltersDraftFull =
    VaccinationProtocolsIndexModuleFilters & TabledataListStandardDraft;

export type VaccinationProtocolsIndexCan = {
    create: boolean;
    update: boolean;
    delete: boolean;
};

export const IS_ACTIVE_FILTER_OPTIONS = isActiveFilterOptions('m');

export function formatIsActive(value: boolean): string {
    return formatIsActiveBase(value, 'm');
}

export type ProtocolItemFormRow = {
    key: string;
    product_id: string;
    schedule_type: VaccinationScheduleType;
    week_number: string;
    min_age_weeks: string;
    max_age_weeks: string;
    interval_months: string;
    series_key: string;
};

export function emptyProtocolItemRow(): ProtocolItemFormRow {
    return {
        key: crypto.randomUUID(),
        product_id: '',
        schedule_type: 'from_birth_weeks',
        week_number: '8',
        min_age_weeks: '',
        max_age_weeks: '',
        interval_months: '',
        series_key: '',
    };
}

export function itemsFromProtocol(
    items: VaccinationProtocolItem[] | undefined,
): ProtocolItemFormRow[] {
    if (items === undefined || items.length === 0) {
        return [emptyProtocolItemRow()];
    }

    return items.map((item) => ({
        key: item.id ?? crypto.randomUUID(),
        product_id: item.product_id,
        schedule_type: item.schedule_type,
        week_number: item.week_number != null ? String(item.week_number) : '',
        min_age_weeks:
            item.min_age_weeks != null ? String(item.min_age_weeks) : '',
        max_age_weeks:
            item.max_age_weeks != null ? String(item.max_age_weeks) : '',
        interval_months:
            item.interval_months != null ? String(item.interval_months) : '',
        series_key: item.series_key ?? '',
    }));
}
