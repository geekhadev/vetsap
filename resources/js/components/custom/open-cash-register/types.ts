import type {
    CashRegisterCloseLinePreview,
    CashRegisterOfficeOption,
    OpenCashRegisterShared,
} from '@/types/cash-register';

export type OpenCashRegisterDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    offices: CashRegisterOfficeOption[];
};

export type CloseCashRegisterDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cashRegister: OpenCashRegisterShared;
    lines: CashRegisterCloseLinePreview[];
};
