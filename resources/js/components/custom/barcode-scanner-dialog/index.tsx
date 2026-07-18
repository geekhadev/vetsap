import {
    Html5Qrcode,
    Html5QrcodeSupportedFormats,
} from 'html5-qrcode';
import { useEffect, useId, useRef, useState } from 'react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import type { BarcodeScannerDialogProps } from './types';

export type { BarcodeScannerDialogProps } from './types';

/** Tiempo mínimo entre escaneos válidos para evitar lecturas repetidas. */
const SCAN_COOLDOWN_MS = 1500;

const BARCODE_FORMATS = [
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.UPC_E,
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.CODE_39,
    Html5QrcodeSupportedFormats.CODE_93,
    Html5QrcodeSupportedFormats.ITF,
    Html5QrcodeSupportedFormats.QR_CODE,
];

const SCAN_CONFIG = {
    fps: 8,
    qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
        const width = Math.min(Math.floor(viewfinderWidth * 0.85), 320);
        const height = Math.min(Math.floor(viewfinderHeight * 0.35), 140);

        return { width, height };
    },
    aspectRatio: 1.777,
};

let scanBeepAudioContext: AudioContext | null = null;

function playScanBeep(): void {
    try {
        const AudioContextCtor =
            window.AudioContext ??
            (
                window as unknown as {
                    webkitAudioContext?: typeof AudioContext;
                }
            ).webkitAudioContext;

        if (!AudioContextCtor) {
            return;
        }

        scanBeepAudioContext ??= new AudioContextCtor();

        if (scanBeepAudioContext.state === 'suspended') {
            void scanBeepAudioContext.resume();
        }

        const oscillator = scanBeepAudioContext.createOscillator();
        const gain = scanBeepAudioContext.createGain();
        const now = scanBeepAudioContext.currentTime;

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(980, now);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.12, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

        oscillator.connect(gain);
        gain.connect(scanBeepAudioContext.destination);
        oscillator.start(now);
        oscillator.stop(now + 0.15);
    } catch {
        // El pitido es opcional; no bloquear el escaneo.
    }
}

function isSecureCameraContext(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    return (
        window.isSecureContext ||
        window.location.protocol === 'https:' ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1'
    );
}

function cameraErrorMessage(error: unknown): string {
    const message =
        error instanceof Error
            ? error.message
            : typeof error === 'string'
              ? error
              : '';

    const normalized = message.toLowerCase();

    if (!isSecureCameraContext()) {
        return 'La cámara solo funciona en HTTPS o localhost.';
    }

    if (
        normalized.includes('notallowed') ||
        normalized.includes('permission') ||
        normalized.includes('denied')
    ) {
        return 'El navegador bloqueó la cámara. Permite el acceso en la barra de dirección y reintenta.';
    }

    if (
        normalized.includes('notfound') ||
        normalized.includes('requested device not found') ||
        normalized.includes('no cameras')
    ) {
        return 'No se encontró ninguna cámara en este dispositivo.';
    }

    if (
        normalized.includes('notreadable') ||
        normalized.includes('trackstart') ||
        normalized.includes('could not start video source')
    ) {
        return 'La cámara está en uso por otra aplicación. Ciérrala e intenta de nuevo.';
    }

    if (
        normalized.includes('overconstrained') ||
        normalized.includes('environment')
    ) {
        return 'No se pudo usar la cámara trasera. Reintenta con otra cámara.';
    }

    return message.trim() !== ''
        ? `No se pudo iniciar la cámara: ${message}`
        : 'No se pudo acceder a la cámara. Revisa los permisos del navegador.';
}

async function waitForReaderElement(
    readerId: string,
    attempts = 20,
): Promise<HTMLElement> {
    for (let attempt = 0; attempt < attempts; attempt++) {
        const element = document.getElementById(readerId);

        if (element) {
            return element;
        }

        await new Promise((resolve) => {
            window.setTimeout(resolve, 50);
        });
    }

    throw new Error('No se pudo preparar el visor de la cámara.');
}

async function resolveCameraConfigs(): Promise<
    Array<string | MediaTrackConstraints>
> {
    const cameras = await Html5Qrcode.getCameras();

    if (cameras.length === 0) {
        throw new Error('No cameras found');
    }

    const ranked = [...cameras].sort((a, b) => {
        const score = (label: string): number => {
            if (/back|rear|environment|trasera|posterior/i.test(label)) {
                return 0;
            }

            if (/front|user|frontal|face/i.test(label)) {
                return 2;
            }

            return 1;
        };

        return score(a.label) - score(b.label);
    });

    return [
        ...ranked.map((camera) => camera.id),
        { facingMode: 'environment' },
        { facingMode: 'user' },
    ];
}

export function BarcodeScannerDialog({
    open,
    onOpenChange,
    onScan,
    title = 'Escanear código',
    description = 'Apunta la cámara al código de barra del producto.',
    hint = 'Puedes escanear varios productos. Tras cada lectura hay una breve pausa.',
    scanCooldownMs = SCAN_COOLDOWN_MS,
}: BarcodeScannerDialogProps) {
    const reactId = useId();
    const readerId = `barcode-reader-${reactId.replace(/:/g, '')}`;
    const [error, setError] = useState<string | null>(null);
    const [starting, setStarting] = useState(false);
    const [cooldownActive, setCooldownActive] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const handlingRef = useRef(false);
    const cooldownTimerRef = useRef<number | null>(null);
    const lastBarcodeRef = useRef<string | null>(null);
    const onScanRef = useRef(onScan);

    useEffect(() => {
        onScanRef.current = onScan;
    }, [onScan]);

    useEffect(() => {
        if (!open) {
            setError(null);
            setStarting(false);
            setCooldownActive(false);
            handlingRef.current = false;
            lastBarcodeRef.current = null;

            if (cooldownTimerRef.current !== null) {
                window.clearTimeout(cooldownTimerRef.current);
                cooldownTimerRef.current = null;
            }

            return;
        }

        let cancelled = false;
        setError(null);
        setStarting(true);
        setCooldownActive(false);

        const startCooldown = () => {
            setCooldownActive(true);

            if (cooldownTimerRef.current !== null) {
                window.clearTimeout(cooldownTimerRef.current);
            }

            cooldownTimerRef.current = window.setTimeout(() => {
                handlingRef.current = false;
                setCooldownActive(false);
                cooldownTimerRef.current = null;
            }, scanCooldownMs);
        };

        const startScanner = async () => {
            try {
                if (!isSecureCameraContext()) {
                    throw new Error('insecure context');
                }

                await waitForReaderElement(readerId);

                // Deja terminar la animación del diálogo para que el visor tenga tamaño.
                await new Promise((resolve) => {
                    window.setTimeout(resolve, 150);
                });

                if (cancelled) {
                    return;
                }

                const scanner = new Html5Qrcode(readerId, {
                    formatsToSupport: BARCODE_FORMATS,
                    verbose: false,
                });
                scannerRef.current = scanner;

                const cameraConfigs = await resolveCameraConfigs();
                let lastError: unknown = null;

                for (const cameraConfig of cameraConfigs) {
                    if (cancelled) {
                        return;
                    }

                    try {
                        await scanner.start(
                            cameraConfig,
                            SCAN_CONFIG,
                            (decodedText) => {
                                if (handlingRef.current || cancelled) {
                                    return;
                                }

                                const barcode = decodedText.trim();

                                if (barcode === '') {
                                    return;
                                }

                                // Evita re-lecturas inmediatas del mismo código.
                                if (lastBarcodeRef.current === barcode) {
                                    return;
                                }

                                handlingRef.current = true;
                                lastBarcodeRef.current = barcode;
                                playScanBeep();
                                startCooldown();

                                void (async () => {
                                    try {
                                        await onScanRef.current(barcode);
                                    } catch {
                                        // El consumidor maneja errores; el cooldown sigue activo.
                                    } finally {
                                        // Permite el mismo código solo después del cooldown.
                                        window.setTimeout(() => {
                                            if (
                                                lastBarcodeRef.current ===
                                                barcode
                                            ) {
                                                lastBarcodeRef.current = null;
                                            }
                                        }, scanCooldownMs);
                                    }
                                })();
                            },
                            () => {
                                // Ignore frame-level "not found" noise.
                            },
                        );

                        if (!cancelled) {
                            setStarting(false);
                        }

                        return;
                    } catch (startError) {
                        lastError = startError;

                        try {
                            if (scanner.isScanning) {
                                await scanner.stop();
                            }
                        } catch {
                            // Continue trying the next camera.
                        }
                    }
                }

                throw (
                    lastError ?? new Error('No se pudo iniciar ninguna cámara.')
                );
            } catch (startError) {
                if (!cancelled) {
                    setStarting(false);
                    setError(cameraErrorMessage(startError));
                }
            }
        };

        void startScanner();

        return () => {
            cancelled = true;
            const scanner = scannerRef.current;
            scannerRef.current = null;

            if (cooldownTimerRef.current !== null) {
                window.clearTimeout(cooldownTimerRef.current);
                cooldownTimerRef.current = null;
            }

            if (!scanner) {
                return;
            }

            void (async () => {
                try {
                    if (scanner.isScanning) {
                        await scanner.stop();
                    }
                } catch {
                    // Camera may already be stopped.
                }

                try {
                    scanner.clear();
                } catch {
                    // Element may already be unmounted.
                }
            })();
        };
    }, [open, readerId, scanCooldownMs]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                    <div
                        id={readerId}
                        className="bg-muted min-h-48 overflow-hidden rounded-md [&_video]:h-auto [&_video]:w-full [&_video]:rounded-md"
                    />

                    {starting && !error ? (
                        <p className="text-muted-foreground text-center text-sm">
                            Iniciando cámara…
                        </p>
                    ) : null}

                    {!starting && !error && cooldownActive ? (
                        <p className="text-muted-foreground text-center text-sm">
                            Código leído. Espera un momento para el siguiente…
                        </p>
                    ) : null}

                    {error ? (
                        <div className="space-y-2">
                            <p className="text-destructive text-center text-sm">
                                {error}
                            </p>
                            <button
                                type="button"
                                className="text-primary mx-auto block text-sm underline-offset-4 hover:underline"
                                onClick={() => {
                                    setError(null);
                                    onOpenChange(false);
                                    window.setTimeout(
                                        () => onOpenChange(true),
                                        50,
                                    );
                                }}
                            >
                                Reintentar
                            </button>
                        </div>
                    ) : hint && !cooldownActive ? (
                        <p className="text-muted-foreground text-center text-xs">
                            {hint}
                        </p>
                    ) : null}
                </div>
            </DialogContent>
        </Dialog>
    );
}
