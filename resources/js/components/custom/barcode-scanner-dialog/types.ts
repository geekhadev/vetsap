export type BarcodeScannerDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onScan: (barcode: string) => void | Promise<void>;
    title?: string;
    description?: string;
    /** Texto de ayuda bajo el visor. `null` lo oculta. */
    hint?: string | null;
    /** Pausa entre escaneos válidos (ms). Por defecto 1500. */
    scanCooldownMs?: number;
};
