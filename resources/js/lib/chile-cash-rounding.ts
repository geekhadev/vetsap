/**
 * Redondeo efectivo Chile: múltiplos de `step` (default 10).
 * Residuo &lt; threshold → abajo; si no → arriba.
 */
export function roundChileCashAmount(
    amount: number,
    step = 10,
    threshold = 5,
): number {
    if (amount <= 0) {
        return 0;
    }

    const safeStep = Math.max(1, step);
    const remainder = amount % safeStep;

    if (remainder === 0) {
        return amount;
    }

    if (remainder < threshold) {
        return amount - remainder;
    }

    return amount + (safeStep - remainder);
}
