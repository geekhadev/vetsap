import { usePage } from '@inertiajs/react';
import { ShoppingCart, Wallet } from 'lucide-react';
import { useState } from 'react';
import { CloseCashRegisterDialog } from '@/components/custom/open-cash-register/close-cash-register-dialog';
import { OpenCashRegisterDialog } from '@/components/custom/open-cash-register/open-cash-register-dialog';
import { PosDialog } from '@/components/custom/pos/pos-dialog';
import { SaleDocumentPreviewDialog } from '@/components/custom/sale-document-preview';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { resolvePosCustomerIdFromCurrentPage } from '@/lib/pos-route-customer';
import type { CashRegisterSharedProps } from '@/types/cash-register';

export function OpenCashRegister() {
    const page = usePage<{
        cash_register: CashRegisterSharedProps;
    }>();
    const { cash_register: cashRegister } = page.props;

    const [openDialogOpen, setOpenDialogOpen] = useState(false);
    const [posDialogOpen, setPosDialogOpen] = useState(false);
    const [closeDialogOpen, setCloseDialogOpen] = useState(false);
    const [previewDocumentId, setPreviewDocumentId] = useState<string | null>(
        null,
    );
    const [initialCustomerId, setInitialCustomerId] = useState<string | null>(
        null,
    );

    const hasOpen = cashRegister.open !== null;
    const isFromPreviousDay =
        cashRegister.open?.is_from_previous_day === true;
    const canOperateOpen = hasOpen && cashRegister.can_close;
    // Caja de un día anterior: obligar cierre antes de usar POS o abrir otra.
    const showClose = canOperateOpen && isFromPreviousDay;
    const showPos = canOperateOpen && !isFromPreviousDay;
    const showOpen = !hasOpen && cashRegister.can_open;

    if (!showOpen && !showPos && !showClose) {
        return null;
    }

    const officeSuffix = cashRegister.open?.office
        ? ` · ${cashRegister.open.office.name}`
        : '';

    function openPosFromHeader(): void {
        const customerId = resolvePosCustomerIdFromCurrentPage({
            component: page.component,
            props: page.props as Record<string, unknown>,
        });

        setInitialCustomerId(customerId);
        setPosDialogOpen(true);
    }

    return (
        <>
            {showClose ? (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive h-9 shrink-0 cursor-pointer gap-1.5 px-2.5"
                            onClick={() => setCloseDialogOpen(true)}
                            aria-label="Cerrar caja"
                        >
                            <Wallet className="size-4" />
                            <span>Cerrar caja</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        Debes cerrar la caja del día anterior antes de abrir una
                        nueva
                        {officeSuffix}
                    </TooltipContent>
                </Tooltip>
            ) : null}

            {showPos ? (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground h-9 shrink-0 cursor-pointer gap-1.5 px-2.5"
                            onClick={openPosFromHeader}
                            aria-label="Caja"
                        >
                            <ShoppingCart className="size-4" />
                            <span>Caja</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        Punto de venta
                        {officeSuffix}
                    </TooltipContent>
                </Tooltip>
            ) : null}

            {showOpen ? (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground h-9 shrink-0 cursor-pointer gap-1.5 px-2.5"
                            onClick={() => setOpenDialogOpen(true)}
                            aria-label="Abrir caja"
                            disabled={cashRegister.offices.length === 0}
                        >
                            <Wallet className="size-4" />
                            <span>Abrir caja</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        {cashRegister.offices.length === 0
                            ? 'Configura una sucursal para abrir caja'
                            : 'Registrar apertura de caja en efectivo'}
                    </TooltipContent>
                </Tooltip>
            ) : null}

            {openDialogOpen && showOpen ? (
                <OpenCashRegisterDialog
                    open={openDialogOpen}
                    onOpenChange={setOpenDialogOpen}
                    offices={cashRegister.offices}
                />
            ) : null}

            {posDialogOpen && showPos ? (
                <PosDialog
                    open={posDialogOpen}
                    initialCustomerId={initialCustomerId}
                    onOpenChange={(nextOpen) => {
                        setPosDialogOpen(nextOpen);

                        if (!nextOpen) {
                            setInitialCustomerId(null);
                        }
                    }}
                    onRequestCloseCashRegister={() => {
                        setPosDialogOpen(false);
                        setInitialCustomerId(null);
                        setCloseDialogOpen(true);
                    }}
                    onCharged={(saleDocumentId) => {
                        setPreviewDocumentId(saleDocumentId);
                    }}
                />
            ) : null}

            {closeDialogOpen &&
            cashRegister.open &&
            (showPos || showClose) ? (
                <CloseCashRegisterDialog
                    open={closeDialogOpen}
                    onOpenChange={setCloseDialogOpen}
                    cashRegister={cashRegister.open}
                    lines={cashRegister.open.lines}
                />
            ) : null}

            <SaleDocumentPreviewDialog
                open={previewDocumentId !== null}
                saleDocumentId={previewDocumentId}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen) {
                        setPreviewDocumentId(null);
                    }
                }}
            />
        </>
    );
}
