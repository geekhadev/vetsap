import type { TabledataListStandardDraft } from '@/components/custom/tabledata';
import type {
    InventoryMovementTypeValue,
    MovementTypeOption,
} from '@/pages/store/movement-categories/types';
import type { PaginatedListFilters } from '@/types/list-filters';

export type { InventoryMovementTypeValue, MovementTypeOption };

export type ProductFilterOption = {
    id: string;
    name: string;
    barcode: string | null;
};

export type ProductMovementProductRef = {
    id: string;
    name: string;
    barcode: string | null;
};

export type ProductMovementCategoryRef = {
    id: string;
    name: string;
    type: InventoryMovementTypeValue;
};

export type ProductMovementInventoryRef = {
    id: string;
    type: InventoryMovementTypeValue;
    number: number;
    moved_at: string;
    movement_category_id: string;
    movement_category?: ProductMovementCategoryRef;
};

export type ProductMovement = {
    id: string;
    inventory_movement_id: string;
    product_id: string;
    quantity: number;
    product?: ProductMovementProductRef;
    inventory_movement?: ProductMovementInventoryRef;
    created_at: string;
    updated_at: string;
};

export const PRODUCT_MOVEMENTS_INDEX_MODULE_FILTER_KEYS = [
    'type',
    'product_id',
] as const;

export type ProductMovementsIndexModuleFilterKey =
    (typeof PRODUCT_MOVEMENTS_INDEX_MODULE_FILTER_KEYS)[number];

export type ProductMovementsIndexModuleFilters = {
    [K in ProductMovementsIndexModuleFilterKey]: string;
};

export type ProductMovementListFilters = PaginatedListFilters & {
    [K in ProductMovementsIndexModuleFilterKey]?: string | null;
};

export type ProductMovementsIndexFiltersDraftFull =
    ProductMovementsIndexModuleFilters & TabledataListStandardDraft;

export function formatMovementType(
    type: InventoryMovementTypeValue,
    options: MovementTypeOption[],
): string {
    return options.find((option) => option.value === type)?.label ?? type;
}

export function formatProductFilterLabel(product: ProductFilterOption): string {
    const barcode = product.barcode ? ` · ${product.barcode}` : '';

    return `${product.name}${barcode}`;
}
