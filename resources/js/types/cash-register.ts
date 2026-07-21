export type CashRegisterOfficeOption = {
    id: string;
    name: string;
    is_main: boolean;
};

export type CashRegisterCloseLinePreview = {
    payment_method_id: string;
    payment_method_name: string;
    payment_method_code: string;
    system_amount: number;
};

export type OpenCashRegisterShared = {
    id: string;
    opened_at: string | null;
    opening_amount: number;
    is_from_previous_day: boolean;
    office: { id: string; name: string } | null;
    lines: CashRegisterCloseLinePreview[];
};

export type CashRegisterSharedProps = {
    open: OpenCashRegisterShared | null;
    offices: CashRegisterOfficeOption[];
    can_open: boolean;
    can_close: boolean;
};
