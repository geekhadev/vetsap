import { useHttp, usePage } from '@inertiajs/react';
import {
    LoaderCircle,
    PackagePlus,
    Pencil,
    ShoppingCart,
    Trash2,
    Wallet,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { CurrencyDisplay } from '@/components/custom/currency-display';
import { PosAddProductButton } from '@/components/custom/pos/add-product-button';
import {
    PosAddServiceButton
    
} from '@/components/custom/pos/add-service-button';
import type {PosServiceOption} from '@/components/custom/pos/add-service-button';
import {
    PosChargePaymentsDialog,
} from '@/components/custom/pos/charge-payments-dialog';
import type { PosChargeConfirmPayload } from '@/components/custom/pos/charge-payments-dialog';
import { PosCustomerSearch } from '@/components/custom/pos/customer-search';
import type {
    PosCustomerAttentionsPayload,
    PosCustomerSearchResult,
    PosDialogProps,
    PosOptionsPayload,
    PosPaymentMethodOption,
    PosPaymentTypeOption,
    PosSiiTaxDocumentTypeOption,
} from '@/components/custom/pos/types';
import { usePosCart } from '@/components/custom/pos/use-pos-cart';
import type { ProductAutocompleteOption } from '@/components/custom/product-autocomplete';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { cn } from '@/lib/utils';
import {
    charge as posCharge,
    options as posOptions,
} from '@/routes/sale/pos';
import {
    draftAttentions as posCustomerDraftAttentions,
    draftGlobalDiscount as posDraftGlobalDiscount,
    draftProducts as posDraftProducts,
    draftServices as posDraftServices,
    search as posCustomerSearch,
} from '@/routes/sale/pos/customers';
import {
    destroy as posDraftDetailDestroy,
    update as posDraftDetailUpdate,
} from '@/routes/sale/pos/customers/draft-details';
import { search as posServiceSearch } from '@/routes/sale/pos/services';
import { search as productAutocompleteSearch } from '@/routes/store/products';
import { formatIdentityDocument } from '@/types';
import type { CashRegisterSharedProps } from '@/types/cash-register';

export type { PosDialogProps } from '@/components/custom/pos/types';

type DraftAttentionsResponse = {
    data: PosCustomerAttentionsPayload;
};

type PosOptionsResponse = {
    data: PosOptionsPayload;
};

type ChargeResponse = {
    data: {
        id: string;
        total_amount: number;
        paid_amount: number;
        cash_rounded_total: number;
    };
};

type DetailSavePatch = {
    quantity?: number;
    discount_percent?: number;
};

const DETAIL_SAVE_DEBOUNCE_MS = 400;
const FIELD_CLASS = 'space-y-1.5';

export function PosDialog({
    open,
    onOpenChange,
    onRequestCloseCashRegister,
    onCharged,
    initialCustomerId = null,
}: PosDialogProps) {
    const { cash_register: cashRegister } = usePage<{
        cash_register: CashRegisterSharedProps;
    }>().props;

    const cart = usePosCart();
    const [loadingCustomer, setLoadingCustomer] = useState(false);
    const [savingDraft, setSavingDraft] = useState(false);
    const [charging, setCharging] = useState(false);
    const [chargePaymentsOpen, setChargePaymentsOpen] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState<
        PosPaymentMethodOption[]
    >([]);
    const [paymentTypes, setPaymentTypes] = useState<PosPaymentTypeOption[]>(
        [],
    );
    const [siiTypes, setSiiTypes] = useState<PosSiiTaxDocumentTypeOption[]>(
        [],
    );
    const [siiTypeId, setSiiTypeId] = useState('');
    const [cashRoundTo, setCashRoundTo] = useState(10);
    const [cashRoundThreshold, setCashRoundThreshold] = useState(5);
    const [editingGlobalDiscount, setEditingGlobalDiscount] = useState(false);

    const attentionsHttp = useHttp({});
    const optionsHttp = useHttp({});
    const draftHttp = useHttp({});
    const chargeHttp = useHttp({});
    const detailSaveTimers = useRef<
        Map<string, ReturnType<typeof setTimeout>>
    >(new Map());
    const pendingDetailPatches = useRef<Map<string, DetailSavePatch>>(
        new Map(),
    );
    const globalDiscountTimer = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );

    useEffect(() => {
        const timers = detailSaveTimers.current;

        return () => {
            for (const timer of timers.values()) {
                clearTimeout(timer);
            }

            timers.clear();

            if (globalDiscountTimer.current) {
                clearTimeout(globalDiscountTimer.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!open) {
            for (const timer of detailSaveTimers.current.values()) {
                clearTimeout(timer);
            }

            detailSaveTimers.current.clear();
            pendingDetailPatches.current.clear();

            if (globalDiscountTimer.current) {
                clearTimeout(globalDiscountTimer.current);
                globalDiscountTimer.current = null;
            }

            cart.reset();
            setLoadingCustomer(false);
            setSavingDraft(false);
            setCharging(false);
            setChargePaymentsOpen(false);
            setSiiTypeId('');
            setEditingGlobalDiscount(false);

            return;
        }

        void (async () => {
            try {
                const response = (await optionsHttp.get(
                    posOptions.url(),
                )) as PosOptionsResponse;
                setPaymentMethods(response.data.payment_methods);
                setPaymentTypes(response.data.payment_types);
                setSiiTypes(response.data.sii_tax_document_types);
                setCashRoundTo(response.data.cash_round_to);
                setCashRoundThreshold(response.data.cash_round_threshold);
                setSiiTypeId(response.data.sii_tax_document_types[0]?.id ?? '');
            } catch {
                toast.error('No se pudieron cargar las opciones de cobro.');
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- load options when opening
    }, [open]);

    useEffect(() => {
        if (!open || !initialCustomerId) {
            return;
        }

        void handleSelectCustomerById(initialCustomerId);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per open+customer
    }, [open, initialCustomerId]);

    async function handleSelectCustomerById(customerId: string): Promise<void> {
        setLoadingCustomer(true);

        try {
            const response = (await attentionsHttp.get(
                posCustomerDraftAttentions.url(customerId),
            )) as DraftAttentionsResponse;

            cart.loadCustomerAttentions(response.data);

            const serviceCount = response.data.attentions.reduce(
                (sum, attention) => sum + attention.services.length,
                0,
            );

            if (response.data.attentions.length === 0) {
                toast.message(
                    'El cliente no tiene ventas abiertas. Puedes agregar productos o servicios.',
                );
            } else if (serviceCount === 0) {
                toast.message(
                    'Hay ventas abiertas sin ítems. Agrega productos o servicios para cobrar.',
                );
            }
        } catch {
            toast.error('No se pudieron cargar las ventas abiertas del cliente.');
        } finally {
            setLoadingCustomer(false);
        }
    }

    async function handleSelectCustomer(
        customer: PosCustomerSearchResult,
    ): Promise<void> {
        await handleSelectCustomerById(customer.id);
    }

    async function handleAddProduct(
        product: ProductAutocompleteOption,
    ): Promise<void> {
        if (!cart.customer) {
            toast.error('Selecciona un cliente antes de agregar productos.');

            return;
        }

        setSavingDraft(true);

        try {
            draftHttp.transform(() => ({
                product_id: product.id,
                quantity_delta: 1,
            }));

            const response = (await draftHttp.post(
                posDraftProducts.url(cart.customer.id),
            )) as DraftAttentionsResponse;

            cart.loadCustomerAttentions(response.data);
        } catch {
            toast.error('No se pudo guardar el producto en el documento.');
        } finally {
            setSavingDraft(false);
        }
    }

    async function handleAddService(
        service: PosServiceOption,
    ): Promise<void> {
        if (!cart.customer) {
            toast.error('Selecciona un cliente antes de agregar servicios.');

            return;
        }

        setSavingDraft(true);

        try {
            draftHttp.transform(() => ({
                service_id: service.id,
                quantity_delta: 1,
            }));

            const response = (await draftHttp.post(
                posDraftServices.url(cart.customer.id),
            )) as DraftAttentionsResponse;

            cart.loadCustomerAttentions(response.data);
        } catch {
            toast.error('No se pudo guardar el servicio en el documento.');
        } finally {
            setSavingDraft(false);
        }
    }

    function scheduleDetailSave(
        lineKey: string,
        detailId: string,
        patch: DetailSavePatch,
    ): void {
        if (!cart.customer) {
            return;
        }

        const previous = pendingDetailPatches.current.get(lineKey) ?? {};
        pendingDetailPatches.current.set(lineKey, { ...previous, ...patch });

        const existingTimer = detailSaveTimers.current.get(lineKey);

        if (existingTimer) {
            clearTimeout(existingTimer);
        }

        const customerId = cart.customer.id;

        detailSaveTimers.current.set(
            lineKey,
            setTimeout(() => {
                detailSaveTimers.current.delete(lineKey);
                const payload = pendingDetailPatches.current.get(lineKey);
                pendingDetailPatches.current.delete(lineKey);

                if (!payload) {
                    return;
                }

                void (async () => {
                    setSavingDraft(true);

                    try {
                        draftHttp.transform(() => payload);

                        const response = (await draftHttp.patch(
                            posDraftDetailUpdate.url({
                                customer: customerId,
                                detail: detailId,
                            }),
                        )) as DraftAttentionsResponse;

                        cart.loadCustomerAttentions(response.data);
                    } catch {
                        toast.error('No se pudo guardar el detalle.');
                        await handleSelectCustomerById(customerId);
                    } finally {
                        setSavingDraft(false);
                    }
                })();
            }, DETAIL_SAVE_DEBOUNCE_MS),
        );
    }

    function handleQuantityChange(
        lineKey: string,
        detailId: string,
        quantity: number,
    ): void {
        if (!cart.customer || lineKey.split(':')[0] === 'service') {
            return;
        }

        const nextQuantity = Number.isFinite(quantity)
            ? Math.max(1, Math.trunc(quantity))
            : 1;

        cart.patchLine(lineKey, { quantity: nextQuantity });
        scheduleDetailSave(lineKey, detailId, { quantity: nextQuantity });
    }

    function handleDiscountChange(
        lineKey: string,
        detailId: string,
        discountPercent: number,
    ): void {
        if (!cart.customer) {
            return;
        }

        const nextDiscount = Number.isFinite(discountPercent)
            ? Math.min(100, Math.max(0, discountPercent))
            : 0;

        cart.patchLine(lineKey, { discountPercent: nextDiscount });
        scheduleDetailSave(lineKey, detailId, {
            discount_percent: nextDiscount,
        });
    }

    function handleGlobalDiscountChange(discountPercent: number): void {
        if (!cart.customer) {
            toast.error('Selecciona un cliente antes de aplicar descuento.');

            return;
        }

        const nextDiscount = Number.isFinite(discountPercent)
            ? Math.min(100, Math.max(0, discountPercent))
            : 0;

        cart.setGlobalDiscount(nextDiscount);

        if (globalDiscountTimer.current) {
            clearTimeout(globalDiscountTimer.current);
        }

        const customerId = cart.customer.id;

        globalDiscountTimer.current = setTimeout(() => {
            globalDiscountTimer.current = null;
            void (async () => {
                setSavingDraft(true);

                try {
                    draftHttp.transform(() => ({
                        global_discount_percent: nextDiscount,
                    }));

                    const response = (await draftHttp.patch(
                        posDraftGlobalDiscount.url(customerId),
                    )) as DraftAttentionsResponse;

                    cart.loadCustomerAttentions(response.data);
                } catch {
                    toast.error('No se pudo guardar el descuento global.');
                    await handleSelectCustomerById(customerId);
                } finally {
                    setSavingDraft(false);
                }
            })();
        }, DETAIL_SAVE_DEBOUNCE_MS);
    }

    async function handleRemoveLine(
        lineKey: string,
        detailId: string,
    ): Promise<void> {
        if (!cart.customer) {
            return;
        }

        const pendingTimer = detailSaveTimers.current.get(lineKey);

        if (pendingTimer) {
            clearTimeout(pendingTimer);
            detailSaveTimers.current.delete(lineKey);
        }

        pendingDetailPatches.current.delete(lineKey);
        setSavingDraft(true);

        try {
            const response = (await draftHttp.delete(
                posDraftDetailDestroy.url({
                    customer: cart.customer.id,
                    detail: detailId,
                }),
            )) as DraftAttentionsResponse;

            cart.loadCustomerAttentions(response.data);
        } catch {
            toast.error('No se pudo quitar el detalle.');
        } finally {
            setSavingDraft(false);
        }
    }

    function openChargePayments(): void {
        if (!cart.customer) {
            toast.error('Selecciona un cliente para cobrar.');

            return;
        }

        if (!cashRegister.open) {
            toast.error('Debes tener una caja abierta para cobrar.');

            return;
        }

        if (cart.draftSaleDocumentIds.length === 0 || cart.lines.length === 0) {
            toast.error('No hay detalles para cobrar.');

            return;
        }

        if (paymentMethods.length === 0) {
            toast.error('No hay métodos de pago disponibles.');

            return;
        }

        if (paymentTypes.length === 0) {
            toast.error('No hay tipos de pago disponibles.');

            return;
        }

        setChargePaymentsOpen(true);
    }

    async function handleCharge(
        payload: PosChargeConfirmPayload,
    ): Promise<void> {
        if (!cart.customer) {
            toast.error('Selecciona un cliente para cobrar.');

            return;
        }

        if (!cashRegister.open) {
            toast.error('Debes tener una caja abierta para cobrar.');

            return;
        }

        const paymentType = paymentTypes.find(
            (type) => type.id === payload.payment_type_id,
        );

        if (!paymentType) {
            toast.error('Selecciona un tipo de pago válido.');

            return;
        }

        if (!paymentType.is_credit && payload.payments.length === 0) {
            toast.error('En contado debes ingresar al menos un pago.');

            return;
        }

        const customer = cart.customer;
        const openRegister = cashRegister.open;

        setCharging(true);

        try {
            chargeHttp.transform(() => ({
                customer_id: customer.id,
                cash_register_id: openRegister.id,
                sii_tax_document_type_id: siiTypeId || null,
                payment_type_id: payload.payment_type_id,
                draft_sale_document_ids: cart.draftSaleDocumentIds,
                global_discount_percent: cart.globalDiscountPercent,
                payments: payload.payments,
            }));

            const response = (await chargeHttp.post(
                posCharge.url(),
            )) as ChargeResponse;

            toast.success('Cobro registrado correctamente.');
            setChargePaymentsOpen(false);
            cart.reset();
            onOpenChange(false);
            onCharged?.(response.data.id);
        } catch {
            toast.error('No se pudo registrar el cobro.');
        } finally {
            setCharging(false);
        }
    }

    return (
        <>
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    'flex h-[min(90vh,52rem)] max-h-[min(90vh,52rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-7xl',
                )}
            >
                <DialogHeader className="shrink-0 border-b px-6 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 pr-8">
                        <DialogTitle className="flex items-center gap-2">
                            <ShoppingCart className="size-5" />
                            Punto de venta
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            Punto de venta
                        </DialogDescription>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onRequestCloseCashRegister}
                        >
                            <Wallet className="size-4" />
                            Cerrar caja
                        </Button>
                    </div>
                </DialogHeader>

                <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
                    <aside className="flex min-h-0 flex-col gap-4 border-b p-4 lg:border-r lg:border-b-0">
                        <PosCustomerSearch
                            searchUrl={posCustomerSearch.url()}
                            disabled={loadingCustomer}
                            onSelect={(customer) => {
                                void handleSelectCustomer(customer);
                            }}
                        />

                        {cart.customer ? (
                            <div className="bg-muted/40 relative space-y-1 rounded-md border p-3 pr-10 text-sm">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-1.5 right-1.5 size-7 text-muted-foreground hover:text-foreground"
                                    title="Quitar cliente"
                                    aria-label="Quitar cliente"
                                    onClick={cart.clearCustomer}
                                >
                                    <X className="size-3.5" />
                                </Button>
                                <p className="font-medium">
                                    {cart.customer.name}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                    {formatIdentityDocument(
                                        cart.customer.document_type,
                                        cart.customer.document_number,
                                    )}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                    {cart.attentions.length} venta
                                    {cart.attentions.length === 1 ? '' : 's'}{' '}
                                    abierta
                                    {cart.attentions.length === 1 ? '' : 's'}
                                </p>
                            </div>
                        ) : null}

                        <div className={FIELD_CLASS}>
                            <Label htmlFor="pos-sii-type">
                                Tipo documento SII
                            </Label>
                            <Select
                                value={siiTypeId}
                                onValueChange={setSiiTypeId}
                            >
                                <SelectTrigger id="pos-sii-type" className="w-full">
                                    <SelectValue placeholder="Selecciona…" />
                                </SelectTrigger>
                                <SelectContent>
                                    {siiTypes.map((type) => (
                                        <SelectItem
                                            key={type.id}
                                            value={type.id}
                                        >
                                            {type.code} · {type.abbreviation}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="mt-auto space-y-3 border-t pt-4">
                            <div className="space-y-1.5 text-sm">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-muted-foreground">
                                        Total exento
                                    </span>
                                    <CurrencyDisplay
                                        value={cart.totals.exempt_amount}
                                    />
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-muted-foreground">
                                        Total afecto
                                    </span>
                                    <CurrencyDisplay
                                        value={cart.totals.net_amount}
                                    />
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-muted-foreground">
                                        Descuentos
                                    </span>
                                    <CurrencyDisplay
                                        value={
                                            cart.totals.details_discount_amount
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-muted-foreground flex min-w-0 items-center gap-1">
                                        {editingGlobalDiscount ? (
                                            <>
                                                <span className="shrink-0">
                                                    Desc. global
                                                </span>
                                                <Input
                                                    id="pos-global-discount"
                                                    type="number"
                                                    min={0}
                                                    max={100}
                                                    step={1}
                                                    autoFocus
                                                    className="h-7 w-14 px-1.5 text-right text-xs"
                                                    value={
                                                        cart.globalDiscountPercent
                                                    }
                                                    disabled={
                                                        !cart.customer ||
                                                        savingDraft
                                                    }
                                                    onChange={(event) =>
                                                        handleGlobalDiscountChange(
                                                            Number(
                                                                event.target
                                                                    .value,
                                                            ),
                                                        )
                                                    }
                                                    onBlur={() =>
                                                        setEditingGlobalDiscount(
                                                            false,
                                                        )
                                                    }
                                                    onKeyDown={(event) => {
                                                        if (
                                                            event.key ===
                                                                'Enter' ||
                                                            event.key ===
                                                                'Escape'
                                                        ) {
                                                            setEditingGlobalDiscount(
                                                                false,
                                                            );
                                                        }
                                                    }}
                                                />
                                                <span className="shrink-0">
                                                    %
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <span>
                                                    Desc. global (
                                                    {
                                                        cart.globalDiscountPercent
                                                    }
                                                    %)
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-6 shrink-0"
                                                    disabled={
                                                        !cart.customer ||
                                                        savingDraft
                                                    }
                                                    onClick={() =>
                                                        setEditingGlobalDiscount(
                                                            true,
                                                        )
                                                    }
                                                    aria-label="Editar descuento global"
                                                >
                                                    <Pencil className="size-3" />
                                                </Button>
                                            </>
                                        )}
                                    </span>
                                    <CurrencyDisplay
                                        value={
                                            cart.totals.global_discount_amount
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-muted-foreground">
                                        IVA
                                    </span>
                                    <CurrencyDisplay
                                        value={cart.totals.tax_amount}
                                    />
                                </div>
                                <div className="flex items-center justify-between gap-2 border-t pt-1.5 font-semibold">
                                    <span>Total</span>
                                    <CurrencyDisplay
                                        value={cart.totals.total_amount}
                                    />
                                </div>
                            </div>
                            <Button
                                type="button"
                                className="w-full"
                                disabled={
                                    cart.lines.length === 0 ||
                                    charging ||
                                    savingDraft ||
                                    !cart.customer
                                }
                                onClick={openChargePayments}
                            >
                                {charging ? 'Cobrando…' : 'Cobrar'}
                            </Button>
                        </div>
                    </aside>

                    <section className="relative flex min-h-0 flex-col">
                        {loadingCustomer || savingDraft ? (
                            <span className="text-muted-foreground absolute top-2 right-3 z-20 flex items-center gap-1.5 rounded-md bg-background/90 px-2 py-1 text-xs shadow-sm">
                                <LoaderCircle className="size-3.5 animate-spin" />
                                {loadingCustomer
                                    ? 'Cargando ventas…'
                                    : 'Guardando…'}
                            </span>
                        ) : null}

                        <div className="min-h-0 flex-1 overflow-auto">
                            {cart.lines.length === 0 ? (
                                <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2 p-8 text-center text-sm">
                                    <PackagePlus className="size-8 opacity-40" />
                                    {cart.attentions.length > 0 ? (
                                        <p>
                                            Hay {cart.attentions.length} venta
                                            {cart.attentions.length === 1
                                                ? ''
                                                : 's'}{' '}
                                            abierta
                                            {cart.attentions.length === 1
                                                ? ''
                                                : 's'}{' '}
                                            sin ítems. Agrega productos o
                                            servicios para cobrarlas.
                                        </p>
                                    ) : cart.customer ? (
                                        <p>
                                            Agrega productos o servicios para
                                            cobrar.
                                        </p>
                                    ) : (
                                        <p>
                                            Selecciona un cliente y agrega
                                            productos o servicios.
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/40 text-muted-foreground sticky top-0 z-10 text-left text-xs">
                                        <tr>
                                            <th className="px-4 py-2 font-medium">
                                                Descripción
                                            </th>
                                            <th className="px-2 py-2 text-right font-medium">
                                                Cant.
                                            </th>
                                            <th className="px-2 py-2 text-right font-medium">
                                                Desc. %
                                            </th>
                                            <th className="px-2 py-2 text-right font-medium">
                                                Precio
                                            </th>
                                            <th className="px-2 py-2 text-right font-medium">
                                                Subtotal
                                            </th>
                                            <th className="w-10 px-2 py-2" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cart.lines.map((line) => (
                                            <tr
                                                key={line.key}
                                                className="border-t align-top"
                                            >
                                                <td className="px-4 py-2">
                                                    <p className="font-medium">
                                                        {line.description}
                                                    </p>
                                                </td>
                                                <td className="px-2 py-2 text-right">
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        step={1}
                                                        className="ml-auto h-8 w-16 text-right"
                                                        value={line.quantity}
                                                        disabled={
                                                            line.type ===
                                                            'service'
                                                        }
                                                        onChange={(event) =>
                                                            handleQuantityChange(
                                                                line.key,
                                                                line.sourceId,
                                                                Number(
                                                                    event.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                    />
                                                </td>
                                                <td className="px-2 py-2 text-right">
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        max={100}
                                                        step={1}
                                                        className="ml-auto h-8 w-16 text-right"
                                                        value={
                                                            line.discountPercent
                                                        }
                                                        onChange={(event) =>
                                                            handleDiscountChange(
                                                                line.key,
                                                                line.sourceId,
                                                                Number(
                                                                    event.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                    />
                                                </td>
                                                <td className="px-2 py-2 text-right">
                                                    <CurrencyDisplay
                                                        value={line.unitPrice}
                                                    />
                                                </td>
                                                <td className="px-2 py-2 text-right font-medium">
                                                    <CurrencyDisplay
                                                        value={
                                                            line.detailTotal
                                                        }
                                                    />
                                                </td>
                                                <td className="px-2 py-2">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8"
                                                        disabled={savingDraft}
                                                        onClick={() => {
                                                            void handleRemoveLine(
                                                                line.key,
                                                                line.sourceId,
                                                            );
                                                        }}
                                                        aria-label="Quitar detalle"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div className="flex shrink-0 flex-wrap items-center gap-1 border-t px-4 py-3">
                            <PosAddProductButton
                                searchUrl={productAutocompleteSearch.url()}
                                disabled={savingDraft}
                                onSelect={(product) => {
                                    void handleAddProduct(product);
                                }}
                            />
                            <PosAddServiceButton
                                searchUrl={posServiceSearch.url()}
                                disabled={savingDraft}
                                onSelect={(service) => {
                                    void handleAddService(service);
                                }}
                            />
                        </div>
                    </section>
                </div>
            </DialogContent>
        </Dialog>

        {chargePaymentsOpen ? (
            <PosChargePaymentsDialog
                open={chargePaymentsOpen}
                onOpenChange={setChargePaymentsOpen}
                paymentMethods={paymentMethods}
                paymentTypes={paymentTypes}
                totalAmount={cart.total}
                cashRoundTo={cashRoundTo}
                cashRoundThreshold={cashRoundThreshold}
                processing={charging}
                onConfirm={(payload) => {
                    void handleCharge(payload);
                }}
            />
        ) : null}
        </>
    );
}
