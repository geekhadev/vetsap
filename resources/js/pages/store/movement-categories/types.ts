import type { TabledataListStandardDraft } from '@/components/custom/tabledata';
import {
    formatIsActive as formatIsActiveBase,
    isActiveFilterOptions,
} from '@/types/active-record';
import type { PaginatedListFilters } from '@/types/list-filters';

export type InventoryMovementTypeValue = 'entry' | 'exit';

export type MovementTypeOption = {
    value: InventoryMovementTypeValue;
    label: string;
};

export type MovementCategory = {
    id: string;
    company_id: string | null;
    name: string;
    type: InventoryMovementTypeValue;
    is_active: boolean;
    inventory_movements_count: number;
    created_at: string;
    updated_at: string;
};

export const MOVEMENT_CATEGORIES_INDEX_MODULE_FILTER_KEYS = [
    'is_active',
    'type',
] as const;

export type MovementCategoriesIndexModuleFilterKey =
    (typeof MOVEMENT_CATEGORIES_INDEX_MODULE_FILTER_KEYS)[number];

export type MovementCategoriesIndexModuleFilters = {
    [K in MovementCategoriesIndexModuleFilterKey]: string;
};

export type MovementCategoryListFilters = PaginatedListFilters & {
    [K in MovementCategoriesIndexModuleFilterKey]?: string | null;
};

export type MovementCategoriesIndexFiltersDraftFull =
    MovementCategoriesIndexModuleFilters & TabledataListStandardDraft;

export type MovementCategoriesIndexCan = {
    create: boolean;
    update: boolean;
    delete: boolean;
};

export const IS_ACTIVE_FILTER_OPTIONS = isActiveFilterOptions('f');

export function formatIsActive(value: boolean): string {
    return formatIsActiveBase(value, 'f');
}

export function formatMovementType(
    type: InventoryMovementTypeValue,
    options: MovementTypeOption[],
): string {
    return options.find((option) => option.value === type)?.label ?? type;
}
