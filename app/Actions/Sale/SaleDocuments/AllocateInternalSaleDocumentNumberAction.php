<?php

namespace App\Actions\Sale\SaleDocuments;

use App\Models\Sale\SaleDocumentNumberSequence;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

final class AllocateInternalSaleDocumentNumberAction
{
    /**
     * Reserva el siguiente número interno (por empresa + tipo SII) de forma concurrente-safe.
     */
    public function execute(string $companyId, string $siiTaxDocumentTypeId): string
    {
        return (string) DB::transaction(function () use ($companyId, $siiTaxDocumentTypeId): int {
            $sequence = $this->lockOrCreateSequence($companyId, $siiTaxDocumentTypeId);

            $sequence->last_number = ((int) $sequence->last_number) + 1;
            $sequence->save();

            return (int) $sequence->last_number;
        });
    }

    private function lockOrCreateSequence(string $companyId, string $siiTaxDocumentTypeId): SaleDocumentNumberSequence
    {
        $existing = SaleDocumentNumberSequence::query()
            ->where('company_id', $companyId)
            ->where('sii_tax_document_type_id', $siiTaxDocumentTypeId)
            ->lockForUpdate()
            ->first();

        if ($existing instanceof SaleDocumentNumberSequence) {
            return $existing;
        }

        try {
            return SaleDocumentNumberSequence::query()->create([
                'company_id' => $companyId,
                'sii_tax_document_type_id' => $siiTaxDocumentTypeId,
                'last_number' => 0,
            ]);
        } catch (QueryException) {
            $retry = SaleDocumentNumberSequence::query()
                ->where('company_id', $companyId)
                ->where('sii_tax_document_type_id', $siiTaxDocumentTypeId)
                ->lockForUpdate()
                ->firstOrFail();

            return $retry;
        }
    }
}
