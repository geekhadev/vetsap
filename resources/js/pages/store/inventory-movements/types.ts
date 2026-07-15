import { formatNumberDisplay } from '@/components/custom/number-display';
import type { TabledataListStandardDraft } from '@/components/custom/tabledata';
import type {
    InventoryMovementTypeValue,
    MovementTypeOption,
} from '@/pages/store/movement-categories/types';
import type { PaginatedListFilters } from '@/types/list-filters';

export type { InventoryMovementTypeValue, MovementTypeOption };

export type MovementCategoryOption = {
    id: string;
    name: string;
    type: InventoryMovementTypeValue;
    is_active: boolean;
};

export type ProductOption = {
    id: string;
    name: string;
    barcode: string | null;
    stock: number;
    is_active: boolean;
};

export type InventoryMovementCategoryRef = {
    id: string;
    name: string;
    type: InventoryMovementTypeValue;
};

export type InventoryMovement = {
    id: string;
    company_id: string;
    type: InventoryMovementTypeValue;
    number: number;
    moved_at: string;
    movement_category_id: string;
    user_id: string;
    movement_category?: InventoryMovementCategoryRef;
    created_at: string;
    updated_at: string;
};

export type InventoryMovementDetailLine = {
    key: string;
    product_id: string;
    quantity: string;
};

export const INVENTORY_MOVEMENTS_INDEX_MODULE_FILTER_KEYS = [
    'type',
    'movement_category_id',
] as const;

export type InventoryMovementsIndexModuleFilterKey =
    (typeof INVENTORY_MOVEMENTS_INDEX_MODULE_FILTER_KEYS)[number];

export type InventoryMovementsIndexModuleFilters = {
    [K in InventoryMovementsIndexModuleFilterKey]: string;
};

export type InventoryMovementListFilters = PaginatedListFilters & {
    [K in InventoryMovementsIndexModuleFilterKey]?: string | null;
};

export type InventoryMovementsIndexFiltersDraftFull =
    InventoryMovementsIndexModuleFilters & TabledataListStandardDraft;

export type InventoryMovementsIndexCan = {
    create: boolean;
};

export function formatMovementType(
    type: InventoryMovementTypeValue,
    options: MovementTypeOption[],
): string {
    return options.find((option) => option.value === type)?.label ?? type;
}

export function formatProductLabel(product: ProductOption): string {
    const barcode = product.barcode ? ` · ${product.barcode}` : '';
    const stock = formatNumberDisplay(product.stock);

    return `${product.name}${barcode} (stock: ${stock})`;
}
