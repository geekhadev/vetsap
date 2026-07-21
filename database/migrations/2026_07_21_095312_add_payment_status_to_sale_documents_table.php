<?php

use App\Enums\Sale\SaleDocumentPaymentStatus;
use App\Enums\Sale\SaleDocumentStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sale_documents', function (Blueprint $table) {
            $table->string('payment_status', 20)
                ->default(SaleDocumentPaymentStatus::Pending->value)
                ->after('status');
            $table->index(['company_id', 'payment_status'], 'sale_documents_company_payment_status_idx');
        });

        DB::table('sale_documents')->orderBy('id')->chunkById(200, function ($documents): void {
            foreach ($documents as $document) {
                $paidAmount = (int) $document->paid_amount;
                $totalAmount = (int) $document->total_amount;
                $legacyStatus = (string) $document->status;

                $paymentStatus = match (true) {
                    $legacyStatus === 'paid' => SaleDocumentPaymentStatus::Paid->value,
                    $paidAmount <= 0 => SaleDocumentPaymentStatus::Pending->value,
                    $paidAmount >= $totalAmount && $totalAmount > 0 => SaleDocumentPaymentStatus::Paid->value,
                    $paidAmount > 0 => SaleDocumentPaymentStatus::Partial->value,
                    default => SaleDocumentPaymentStatus::Pending->value,
                };

                $documentStatus = match ($legacyStatus) {
                    'paid' => SaleDocumentStatus::Issued->value,
                    'draft', 'issued', 'voided', 'merged' => $legacyStatus,
                    default => SaleDocumentStatus::Issued->value,
                };

                DB::table('sale_documents')
                    ->where('id', $document->id)
                    ->update([
                        'status' => $documentStatus,
                        'payment_status' => $paymentStatus,
                    ]);
            }
        });
    }

    public function down(): void
    {
        DB::table('sale_documents')
            ->where('status', SaleDocumentStatus::Issued->value)
            ->where('payment_status', SaleDocumentPaymentStatus::Paid->value)
            ->update(['status' => 'paid']);

        Schema::table('sale_documents', function (Blueprint $table) {
            $table->dropIndex('sale_documents_company_payment_status_idx');
            $table->dropColumn('payment_status');
        });
    }
};
