<?php

use App\Enums\Sale\SaleDocumentStatus;
use App\Models\Sale\SaleDocument;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // Restos del flujo anterior (borrador + pagado). Ya no se dejan fusionados.
        SaleDocument::query()
            ->where('status', SaleDocumentStatus::Merged)
            ->each(function (SaleDocument $document): void {
                $document->delete();
            });
    }

    public function down(): void
    {
        //
    }
};
