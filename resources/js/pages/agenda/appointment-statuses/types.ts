import type { TabledataListStandardDraft } from '@/components/custom/tabledata';
import type { AppointmentStatusColorValue } from '@/lib/appointment-status-colors';
import {
    formatIsActive as formatIsActiveBase,
    isActiveFilterOptions,
} from '@/types/active-record';
import type { PaginatedListFilters } from '@/types/list-filters';

export type AppointmentStatus = {
    id: string;
    company_id: string | null;
    name: string;
    color: AppointmentStatusColorValue;
    is_global: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export const APPOINTMENT_STATUSES_INDEX_MODULE_FILTER_KEYS = [
    'is_active',
] as const;

export type AppointmentStatusesIndexModuleFilterKey =
    (typeof APPOINTMENT_STATUSES_INDEX_MODULE_FILTER_KEYS)[number];

export type AppointmentStatusesIndexModuleFilters = {
    [K in AppointmentStatusesIndexModuleFilterKey]: string;
};

export type AppointmentStatusesListFilters = PaginatedListFilters & {
    [K in AppointmentStatusesIndexModuleFilterKey]?: string | null;
};

export type AppointmentStatusesIndexFiltersDraftFull =
    AppointmentStatusesIndexModuleFilters & TabledataListStandardDraft;

export type AppointmentStatusesIndexCan = {
    create: boolean;
    update: boolean;
    delete: boolean;
};

export const IS_ACTIVE_FILTER_OPTIONS = isActiveFilterOptions('m');

export function formatIsActive(value: boolean): string {
    return formatIsActiveBase(value, 'm');
}
