<?php

namespace App\Support\Sale;

use App\Enums\Sale\TaxTreatment;

/**
 * Cálculo de totales de documento de venta.
 *
 * Reglas:
 * - Productos afectos: precio unitario con IVA incluido.
 * - Exentos: precio completo a monto exento.
 * - Descuento global: según formato DTE SII, se asigna a afectos y/o exentos;
 *   aquí se reparte proporcionalmente entre la base afecta (bruto con IVA post dto.
 *   de detalle) y la base exenta.
 */
final class SaleDocumentTotalsCalculator
{
    /**
     * @param  list<array{
     *     quantity: int,
     *     unit_price: int,
     *     discount_percent: float|int|string,
     *     tax_treatment: TaxTreatment|string,
     *     tax_percent?: float|int|string|null
     * }>  $details
     * @return array{
     *     details: list<array{
     *         quantity: int,
     *         unit_price: int,
     *         discount_percent: float,
     *         discount_amount: int,
     *         tax_treatment: string,
     *         tax_percent: float,
     *         gross_amount: int,
     *         net_amount: int,
     *         exempt_amount: int,
     *         tax_amount: int,
     *         detail_total: int
     *     }>,
     *     tax_percent: float,
     *     tax_amount: int,
     *     details_discount_percent: float,
     *     details_discount_amount: int,
     *     details_discount_net_amount: int,
     *     details_discount_exempt_amount: int,
     *     global_discount_percent: float,
     *     global_discount_amount: int,
     *     global_discount_net_amount: int,
     *     global_discount_exempt_amount: int,
     *     gross_net_amount: int,
     *     gross_exempt_amount: int,
     *     net_amount: int,
     *     exempt_amount: int,
     *     total_amount: int
     * }
     */
    public function calculate(array $details, float|int|string $globalDiscountPercent = 0, ?float $documentTaxPercent = null): array
    {
        $taxPercent = $documentTaxPercent ?? (float) config('vetsap.sale.default_tax_percent', 19);
        $globalPercent = max(0, min(100, (float) $globalDiscountPercent));

        $computedDetails = [];
        $sumGrossBeforeDiscount = 0;
        $detailsDiscountAmount = 0;
        $detailsDiscountTaxable = 0;
        $detailsDiscountExempt = 0;
        $taxablePayable = 0;
        $exemptPayable = 0;

        foreach ($details as $detail) {
            $quantity = max(1, (int) $detail['quantity']);
            $unitPrice = max(0, (int) $detail['unit_price']);
            $discountPercent = max(0, min(100, (float) $detail['discount_percent']));
            $treatment = $detail['tax_treatment'] instanceof TaxTreatment
                ? $detail['tax_treatment']
                : TaxTreatment::from((string) $detail['tax_treatment']);

            $lineTaxPercent = $treatment === TaxTreatment::Taxable
                ? (float) ($detail['tax_percent'] ?? $taxPercent)
                : 0.0;

            $gross = $quantity * $unitPrice;
            $discountAmount = (int) round($gross * $discountPercent / 100);
            $afterDiscount = max(0, $gross - $discountAmount);

            $sumGrossBeforeDiscount += $gross;
            $detailsDiscountAmount += $discountAmount;

            if ($treatment === TaxTreatment::Exempt) {
                $detailsDiscountExempt += $discountAmount;
                $exemptPayable += $afterDiscount;

                $computedDetails[] = [
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'discount_percent' => $discountPercent,
                    'discount_amount' => $discountAmount,
                    'tax_treatment' => $treatment->value,
                    'tax_percent' => 0.0,
                    'gross_amount' => $gross,
                    'net_amount' => 0,
                    'exempt_amount' => $afterDiscount,
                    'tax_amount' => 0,
                    'detail_total' => $afterDiscount,
                ];

                continue;
            }

            $detailsDiscountTaxable += $discountAmount;
            $taxablePayable += $afterDiscount;
            $split = self::splitIvaIncluded($afterDiscount, $lineTaxPercent);

            $computedDetails[] = [
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'discount_percent' => $discountPercent,
                'discount_amount' => $discountAmount,
                'tax_treatment' => $treatment->value,
                'tax_percent' => $lineTaxPercent,
                'gross_amount' => $gross,
                'net_amount' => $split['net'],
                'exempt_amount' => 0,
                'tax_amount' => $split['tax'],
                'detail_total' => $afterDiscount,
            ];
        }

        $payableBeforeGlobal = $taxablePayable + $exemptPayable;
        $globalDiscountAmount = (int) round($payableBeforeGlobal * $globalPercent / 100);

        $globalDiscountTaxable = 0;
        $globalDiscountExempt = 0;

        if ($globalDiscountAmount > 0 && $payableBeforeGlobal > 0) {
            $globalDiscountTaxable = (int) round($globalDiscountAmount * ($taxablePayable / $payableBeforeGlobal));
            $globalDiscountExempt = $globalDiscountAmount - $globalDiscountTaxable;

            if ($globalDiscountTaxable > $taxablePayable) {
                $globalDiscountExempt += $globalDiscountTaxable - $taxablePayable;
                $globalDiscountTaxable = $taxablePayable;
            }

            if ($globalDiscountExempt > $exemptPayable) {
                $overflow = $globalDiscountExempt - $exemptPayable;
                $globalDiscountExempt = $exemptPayable;
                $globalDiscountTaxable = min($taxablePayable, $globalDiscountTaxable + $overflow);
            }
        }

        $finalTaxablePayable = max(0, $taxablePayable - $globalDiscountTaxable);
        $finalExempt = max(0, $exemptPayable - $globalDiscountExempt);
        $finalSplit = self::splitIvaIncluded($finalTaxablePayable, $taxPercent);

        $detailsDiscountPercent = $sumGrossBeforeDiscount > 0
            ? round($detailsDiscountAmount * 100 / $sumGrossBeforeDiscount, 2)
            : 0.0;

        // gross_net / gross_exempt: bases post dto. detalle, pre dto. global (neto afecto y exento)
        $grossNet = 0;
        $grossExempt = 0;
        foreach ($computedDetails as $row) {
            $grossNet += $row['net_amount'];
            $grossExempt += $row['exempt_amount'];
        }

        return [
            'details' => $computedDetails,
            'tax_percent' => $taxPercent,
            'tax_amount' => $finalSplit['tax'],
            'details_discount_percent' => $detailsDiscountPercent,
            'details_discount_amount' => $detailsDiscountAmount,
            'details_discount_net_amount' => $detailsDiscountTaxable,
            'details_discount_exempt_amount' => $detailsDiscountExempt,
            'global_discount_percent' => $globalPercent,
            'global_discount_amount' => $globalDiscountAmount,
            'global_discount_net_amount' => $globalDiscountTaxable,
            'global_discount_exempt_amount' => $globalDiscountExempt,
            'gross_net_amount' => $grossNet,
            'gross_exempt_amount' => $grossExempt,
            'net_amount' => $finalSplit['net'],
            'exempt_amount' => $finalExempt,
            'total_amount' => $finalSplit['net'] + $finalExempt + $finalSplit['tax'],
        ];
    }

    /**
     * @return array{net: int, tax: int}
     */
    public static function splitIvaIncluded(int $amountWithIva, float $taxPercent): array
    {
        if ($amountWithIva <= 0 || $taxPercent <= 0) {
            return ['net' => max(0, $amountWithIva), 'tax' => 0];
        }

        $net = (int) round($amountWithIva / (1 + ($taxPercent / 100)));
        $tax = $amountWithIva - $net;

        return ['net' => $net, 'tax' => $tax];
    }
}
