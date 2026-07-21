<?php

namespace App\Actions\Sale\SaleDocuments;

use App\Enums\Sale\SaleDocumentStatus;
use App\Models\Sale\SaleDocument;
use App\Models\Sale\SaleDocumentDetail;
use App\Support\Sale\SaleDocumentTotalsCalculator;
use Illuminate\Validation\ValidationException;

final class RecalculateSaleDocumentTotalsAction
{
    public function __construct(
        private SaleDocumentTotalsCalculator $calculator,
    ) {}

    public function execute(SaleDocument $document): SaleDocument
    {
        if (in_array($document->status, [SaleDocumentStatus::Merged, SaleDocumentStatus::Voided], true)) {
            throw ValidationException::withMessages([
                'sale_document' => 'No se pueden recalcular documentos fusionados o anulados.',
            ]);
        }

        $document->loadMissing('details');

        $input = $document->details->map(static function (SaleDocumentDetail $detail): array {
            return [
                'quantity' => (int) $detail->quantity,
                'unit_price' => (int) $detail->unit_price,
                'discount_percent' => (float) $detail->discount_percent,
                'tax_treatment' => $detail->tax_treatment,
                'tax_percent' => (float) $detail->tax_percent,
            ];
        })->all();

        $result = $this->calculator->calculate(
            $input,
            (float) $document->global_discount_percent,
            (float) ($document->tax_percent ?: config('vetsap.sale.default_tax_percent', 19)),
        );

        foreach ($document->details as $index => $detail) {
            $computed = $result['details'][$index] ?? null;
            if ($computed === null) {
                continue;
            }

            $detail->update([
                'discount_amount' => $computed['discount_amount'],
                'gross_amount' => $computed['gross_amount'],
                'net_amount' => $computed['net_amount'],
                'exempt_amount' => $computed['exempt_amount'],
                'tax_amount' => $computed['tax_amount'],
                'detail_total' => $computed['detail_total'],
            ]);
        }

        $document->update([
            'tax_percent' => $result['tax_percent'],
            'tax_amount' => $result['tax_amount'],
            'details_discount_percent' => $result['details_discount_percent'],
            'details_discount_amount' => $result['details_discount_amount'],
            'details_discount_net_amount' => $result['details_discount_net_amount'],
            'details_discount_exempt_amount' => $result['details_discount_exempt_amount'],
            'global_discount_percent' => $result['global_discount_percent'],
            'global_discount_amount' => $result['global_discount_amount'],
            'global_discount_net_amount' => $result['global_discount_net_amount'],
            'global_discount_exempt_amount' => $result['global_discount_exempt_amount'],
            'gross_net_amount' => $result['gross_net_amount'],
            'gross_exempt_amount' => $result['gross_exempt_amount'],
            'net_amount' => $result['net_amount'],
            'exempt_amount' => $result['exempt_amount'],
            'total_amount' => $result['total_amount'],
        ]);

        return $document->refresh()->load('details');
    }
}
