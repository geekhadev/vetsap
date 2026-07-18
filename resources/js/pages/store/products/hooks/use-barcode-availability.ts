import { useHttp } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { barcode as productBarcodeLookup } from '@/routes/store/products';

type BarcodeLookupResponse = {
    data: { id: string } | null;
};

const BARCODE_TAKEN_MESSAGE =
    'Ya existe un producto con este código de barras.';

/**
 * Valida unicidad del código de barras vía lookup al terminar de ingresarlo (blur/scan).
 */
export function useBarcodeAvailability(excludeProductId?: string) {
    const [clientError, setClientError] = useState<string | undefined>();
    const barcodeHttp = useHttp({ barcode: '' });
    const barcodeHttpRef = useRef(barcodeHttp);
    const requestIdRef = useRef(0);

    useEffect(() => {
        barcodeHttpRef.current = barcodeHttp;
    }, [barcodeHttp]);

    const clearClientError = () => {
        setClientError(undefined);
    };

    const validateBarcode = async (rawBarcode: string) => {
        const normalized = rawBarcode.trim();
        const requestId = ++requestIdRef.current;

        if (normalized === '') {
            setClientError(undefined);

            return;
        }

        try {
            barcodeHttpRef.current.transform(() => ({ barcode: normalized }));
            const response = (await barcodeHttpRef.current.get(
                productBarcodeLookup.url(),
            )) as BarcodeLookupResponse;

            if (requestId !== requestIdRef.current) {
                return;
            }

            const found = response?.data ?? null;

            if (found !== null && found.id !== excludeProductId) {
                setClientError(BARCODE_TAKEN_MESSAGE);

                return;
            }

            setClientError(undefined);
        } catch {
            if (requestId !== requestIdRef.current) {
                return;
            }

            setClientError(undefined);
        }
    };

    return {
        clientError,
        clearClientError,
        validateBarcode,
    };
}
