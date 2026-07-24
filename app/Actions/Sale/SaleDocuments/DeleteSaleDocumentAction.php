<?php

namespace App\Actions\Sale\SaleDocuments;

use App\Actions\Store\InventoryMovements\ReverseInventoryMovementsForOriginAction;
use App\Models\Sale\SaleDocument;
use Illuminate\Support\Facades\DB;

final class DeleteSaleDocumentAction
{
    public function __construct(
        private ReverseInventoryMovementsForOriginAction $reverseInventoryMovementsForOrigin,
    ) {}

    public function execute(SaleDocument $document, string $userId): void
    {
        DB::transaction(function () use ($document, $userId): void {
            $this->reverseInventoryMovementsForOrigin->forSaleDocument(
                $document->company_id,
                $document->id,
                $userId,
            );

            // Documentos fuente que apuntaban a este (merged_into) quedan en null por FK.
            $document->delete();
        });
    }
}
