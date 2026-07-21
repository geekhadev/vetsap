<?php

namespace App\Actions\Sale\SaleDocuments;

use App\Models\Sale\SaleDocument;
use Illuminate\Support\Facades\DB;

final class DeleteSaleDocumentAction
{
    public function execute(SaleDocument $document): void
    {
        DB::transaction(function () use ($document): void {
            // Documentos fuente que apuntaban a este (merged_into) quedan en null por FK.
            $document->delete();
        });
    }
}
