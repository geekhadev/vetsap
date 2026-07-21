import { Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CurrencyDisplay } from '@/components/custom/currency-display';
import type {
    PosPaymentMethodOption,
    PosPaymentTypeOption,
} from '@/components/custom/pos/types';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { roundChileCashAmount } from '@/lib/chile-cash-rounding';
import { cn } from '@/lib/utils';

export type PosChargePaymentLine = {
    payment_method_id: string;
    amount: number;
};

export type PosChargeConfirmPayload = {
    payment_type_id: string;
    payments: PosChargePaymentLine[];
};

type PaymentRow = {
    key: string;
    payment_method_id: string;
    amount: string;
};

type PosChargePaymentsDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    paymentMethods: PosPaymentMethodOption[];
    paymentTypes: PosPaymentTypeOption[];
    totalAmount: number;
    cashRoundTo: number;
    cashRoundThreshold: number;
    processing?: boolean;
    onConfirm: (payload: PosChargeConfirmPayload) => void;
};

function parseAmount(value: string): number {
    const normalized = value.replace(/\D/g, '');

    if (normalized === '') {
        return 0;
    }

    const parsed = Number(normalized);

    return Number.isFinite(parsed) ? Math.max(0, Math.trunc(parsed)) : 0;
}

function nextRowKey(): string {
    return `pay-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildDefaultRows(
    paymentMethods: PosPaymentMethodOption[],
    totalAmount: number,
    cashRoundTo: number,
    cashRoundThreshold: number,
    isCredit: boolean,
): PaymentRow[] {
    const cash = paymentMethods.find((method) => method.code === 'EF');
    const fallback = paymentMethods[0];
    const methodId = cash?.id ?? fallback?.id ?? '';

    if (methodId === '') {
        return [];
    }

    if (isCredit) {
        return [
            {
                key: nextRowKey(),
                payment_method_id: methodId,
                amount: '',
            },
        ];
    }

    const cashDue = roundChileCashAmount(
        totalAmount,
        cashRoundTo,
        cashRoundThreshold,
    );

    return [
        {
            key: nextRowKey(),
            payment_method_id: methodId,
            amount: cashDue > 0 ? String(cashDue) : '',
        },
    ];
}

export function PosChargePaymentsDialog({
    open,
    onOpenChange,
    paymentMethods,
    paymentTypes,
    totalAmount,
    cashRoundTo,
    cashRoundThreshold,
    processing = false,
    onConfirm,
}: PosChargePaymentsDialogProps) {
    const defaultPaymentTypeId =
        paymentTypes.find((type) => type.code === 'CO')?.id ??
        paymentTypes[0]?.id ??
        '';

    const [paymentTypeId, setPaymentTypeId] = useState(defaultPaymentTypeId);
    const [editedRows, setEditedRows] = useState<PaymentRow[] | null>(null);

    const selectedPaymentType =
        paymentTypes.find((type) => type.id === paymentTypeId) ?? null;
    const isCredit = selectedPaymentType?.is_credit ?? false;

    const defaultRows = useMemo(
        () =>
            buildDefaultRows(
                paymentMethods,
                totalAmount,
                cashRoundTo,
                cashRoundThreshold,
                isCredit,
            ),
        [
            cashRoundThreshold,
            cashRoundTo,
            isCredit,
            paymentMethods,
            totalAmount,
        ],
    );

    const rows = editedRows ?? defaultRows;

    const cashMethodIds = useMemo(
        () =>
            new Set(
                paymentMethods
                    .filter((method) => method.code === 'EF')
                    .map((method) => method.id),
            ),
        [paymentMethods],
    );

    const parsedPayments = useMemo(() => {
        return rows.map((row) => ({
            payment_method_id: row.payment_method_id,
            amount: parseAmount(row.amount),
            isCash: cashMethodIds.has(row.payment_method_id),
        }));
    }, [cashMethodIds, rows]);

    const nonCashPaid = useMemo(
        () =>
            parsedPayments
                .filter((line) => !line.isCash)
                .reduce((sum, line) => sum + line.amount, 0),
        [parsedPayments],
    );

    const cashPaid = useMemo(
        () =>
            parsedPayments
                .filter((line) => line.isCash)
                .reduce((sum, line) => sum + line.amount, 0),
        [parsedPayments],
    );

    const cashDue = useMemo(
        () =>
            roundChileCashAmount(
                Math.max(0, totalAmount - nonCashPaid),
                cashRoundTo,
                cashRoundThreshold,
            ),
        [cashRoundThreshold, cashRoundTo, nonCashPaid, totalAmount],
    );

    const paymentsTotal = nonCashPaid + cashPaid;
    const balanceDue = Math.max(0, totalAmount - paymentsTotal);

    const validationError = useMemo(() => {
        if (paymentTypeId === '') {
            return 'Selecciona el tipo de pago (contado o crédito).';
        }

        if (rows.some((row) => row.payment_method_id === '')) {
            return 'Selecciona un método de pago en cada línea.';
        }

        if (nonCashPaid > totalAmount) {
            return 'Los pagos sin efectivo superan el total.';
        }

        if (isCredit) {
            if (cashPaid > cashDue) {
                return cashDue === 0
                    ? 'Los pagos superan el total.'
                    : `El efectivo no puede superar ${cashDue.toLocaleString('es-CL')} (redondeo Chile).`;
            }

            return null;
        }

        if (paymentsTotal <= 0) {
            return 'En contado debes ingresar el pago completo.';
        }

        if (cashPaid !== cashDue) {
            if (cashDue === 0) {
                return 'La suma de pagos no coincide con el total.';
            }

            return `El efectivo debe ser ${cashDue.toLocaleString('es-CL')} (redondeo Chile).`;
        }

        return null;
    }, [
        cashDue,
        cashPaid,
        isCredit,
        nonCashPaid,
        paymentTypeId,
        paymentsTotal,
        rows,
        totalAmount,
    ]);

    const canConfirm =
        validationError === null && !processing && paymentTypeId !== '';
    const canAddRow = paymentMethods.length > 0 && !processing;

    function updateRows(updater: (previous: PaymentRow[]) => PaymentRow[]): void {
        setEditedRows((previous) => updater(previous ?? defaultRows));
    }

    function handleOpenChange(nextOpen: boolean): void {
        if (!nextOpen) {
            setEditedRows(null);
            setPaymentTypeId(defaultPaymentTypeId);
        }

        onOpenChange(nextOpen);
    }

    function handlePaymentTypeChange(nextTypeId: string): void {
        setPaymentTypeId(nextTypeId);
        setEditedRows(null);
    }

    function handleAddRow(): void {
        const unused = paymentMethods.find(
            (method) =>
                !rows.some((row) => row.payment_method_id === method.id),
        );
        const methodId = unused?.id ?? paymentMethods[0]?.id ?? '';

        if (methodId === '') {
            return;
        }

        updateRows((previous) => [
            ...previous,
            {
                key: nextRowKey(),
                payment_method_id: methodId,
                amount: '',
            },
        ]);
    }

    function handleConfirm(): void {
        if (!canConfirm || paymentTypeId === '') {
            return;
        }

        const payments = parsedPayments
            .filter((line) => line.amount > 0 && line.payment_method_id !== '')
            .map((line) => ({
                payment_method_id: line.payment_method_id,
                amount: line.amount,
            }));

        onConfirm({
            payment_type_id: paymentTypeId,
            payments,
        });
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {isCredit ? 'Emitir documento' : 'Cobrar'}
                    </DialogTitle>
                    <DialogDescription>
                        {isCredit
                            ? 'En crédito puedes emitir sin pagos o con pagos parciales.'
                            : 'En contado debes cubrir el total con métodos de pago.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="bg-muted/40 flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-semibold">
                            <CurrencyDisplay value={totalAmount} />
                        </span>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="pos-payment-type">Tipo de pago</Label>
                        <Select
                            value={paymentTypeId}
                            disabled={processing || paymentTypes.length === 0}
                            onValueChange={handlePaymentTypeChange}
                        >
                            <SelectTrigger id="pos-payment-type" className="w-full">
                                <SelectValue placeholder="Selecciona…" />
                            </SelectTrigger>
                            <SelectContent>
                                {paymentTypes.map((type) => (
                                    <SelectItem key={type.id} value={type.id}>
                                        {type.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        {rows.map((row, index) => (
                            <div
                                key={row.key}
                                className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_8rem_auto] sm:items-end"
                            >
                                <div className="space-y-1.5">
                                    {index === 0 ? (
                                        <Label>Método</Label>
                                    ) : (
                                        <span className="sr-only">Método</span>
                                    )}
                                    <Select
                                        value={row.payment_method_id}
                                        disabled={processing}
                                        onValueChange={(value) => {
                                            updateRows((previous) =>
                                                previous.map((item) =>
                                                    item.key === row.key
                                                        ? {
                                                              ...item,
                                                              payment_method_id:
                                                                  value,
                                                          }
                                                        : item,
                                                ),
                                            );
                                        }}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Selecciona…" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {paymentMethods.map((method) => (
                                                <SelectItem
                                                    key={method.id}
                                                    value={method.id}
                                                >
                                                    {method.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    {index === 0 ? (
                                        <Label
                                            htmlFor={`pos-pay-amount-${row.key}`}
                                        >
                                            Monto
                                        </Label>
                                    ) : (
                                        <span className="sr-only">Monto</span>
                                    )}
                                    <Input
                                        id={`pos-pay-amount-${row.key}`}
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="0"
                                        value={row.amount}
                                        disabled={processing}
                                        onChange={(event) => {
                                            const nextValue =
                                                event.target.value.replace(
                                                    /[^\d]/g,
                                                    '',
                                                );
                                            updateRows((previous) =>
                                                previous.map((item) =>
                                                    item.key === row.key
                                                        ? {
                                                              ...item,
                                                              amount: nextValue,
                                                          }
                                                        : item,
                                                ),
                                            );
                                        }}
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-9 shrink-0"
                                    disabled={
                                        processing ||
                                        (!isCredit && rows.length <= 1)
                                    }
                                    onClick={() => {
                                        updateRows((previous) => {
                                            const next = previous.filter(
                                                (item) => item.key !== row.key,
                                            );

                                            return next;
                                        });
                                    }}
                                    aria-label="Quitar pago"
                                >
                                    <Trash2 className="size-3.5" />
                                </Button>
                            </div>
                        ))}

                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                            disabled={!canAddRow}
                            onClick={handleAddRow}
                        >
                            <Plus className="size-3.5" />
                            Agregar método
                        </Button>
                    </div>

                    <div className="space-y-1 text-sm">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-muted-foreground">
                                Pagado
                            </span>
                            <CurrencyDisplay value={paymentsTotal} />
                        </div>
                        {isCredit ? (
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-muted-foreground">
                                    Saldo
                                </span>
                                <CurrencyDisplay value={balanceDue} />
                            </div>
                        ) : cashDue > 0 ? (
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-muted-foreground">
                                    Efectivo requerido
                                </span>
                                <CurrencyDisplay value={cashDue} />
                            </div>
                        ) : null}
                        {validationError ? (
                            <p className={cn('text-destructive pt-1 text-xs')}>
                                {validationError}
                            </p>
                        ) : (
                            <p className="text-muted-foreground pt-1 text-xs">
                                {isCredit
                                    ? balanceDue > 0
                                        ? 'Puedes emitir a crédito con saldo pendiente.'
                                        : 'Documento quedará pagado al confirmar.'
                                    : 'Listo para confirmar el cobro.'}
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={processing}
                        onClick={() => handleOpenChange(false)}
                    >
                        Volver
                    </Button>
                    <Button
                        type="button"
                        disabled={!canConfirm}
                        onClick={handleConfirm}
                    >
                        {processing
                            ? isCredit
                                ? 'Emitiendo…'
                                : 'Cobrando…'
                            : isCredit
                              ? 'Emitir documento'
                              : 'Confirmar cobro'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
