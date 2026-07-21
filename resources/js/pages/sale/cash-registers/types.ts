import type { TabledataListStandardDraft } from '@/components/custom/tabledata';
import type { PaginatedListFilters } from '@/types/list-filters';

export type CashRegisterStatus = 'open' | 'closed';

/** Resultado del cuadre al cerrar: exacto, excedente o deuda. */
export type CashRegisterBalanceStatus = 'exact' | 'surplus' | 'shortage';

export type CashRegisterUserRef = {
    id: string;
    name: string;
};

export type CashRegisterOfficeRef = {
    id: string;
    name: string;
};

export type CashRegister = {
    id: string;
    company_id: string;
    office_id: string;
    opened_by_user_id: string;
    opened_at: string;
    opening_amount: number;
    /** Suma de montos del sistema por método de pago (en abierta: monto de apertura). */
    total_amount: number;
    /** Suma de montos declarados al cerrar; null si la caja sigue abierta. */
    closing_total_amount: number | null;
    /** Cuadre al cierre; null si la caja sigue abierta. */
    balance_status: CashRegisterBalanceStatus | null;
    status: CashRegisterStatus;
    closed_by_user_id: string | null;
    closed_at: string | null;
    notes: string | null;
    office?: CashRegisterOfficeRef | null;
    opened_by?: CashRegisterUserRef | null;
    closed_by?: CashRegisterUserRef | null;
    created_at: string;
    updated_at: string;
};

export type CashRegistersIndexCan = {
    create: boolean;
};

export const CASH_REGISTERS_INDEX_MODULE_FILTER_KEYS = ['status'] as const;

export type CashRegistersIndexModuleFilterKey =
    (typeof CASH_REGISTERS_INDEX_MODULE_FILTER_KEYS)[number];

export type CashRegistersIndexModuleFilters = {
    [K in CashRegistersIndexModuleFilterKey]: string;
};

export type CashRegisterListFilters = PaginatedListFilters & {
    [K in CashRegistersIndexModuleFilterKey]?: string | null;
};

export type CashRegistersIndexFiltersDraftFull =
    CashRegistersIndexModuleFilters & TabledataListStandardDraft;
