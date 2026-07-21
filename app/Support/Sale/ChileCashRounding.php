<?php

namespace App\Support\Sale;

final class ChileCashRounding
{
    /**
     * Redondeo a múltiplos de 10 CLP: residuo &lt; threshold → abajo; si no → arriba.
     */
    public static function roundCashAmount(int $amount): int
    {
        $step = max(1, (int) config('vetsap.sale.cash_round_to', 10));
        $threshold = max(0, (int) config('vetsap.sale.cash_round_threshold', 5));

        if ($amount <= 0) {
            return 0;
        }

        $remainder = $amount % $step;

        if ($remainder === 0) {
            return $amount;
        }

        if ($remainder < $threshold) {
            return $amount - $remainder;
        }

        return $amount + ($step - $remainder);
    }
}
