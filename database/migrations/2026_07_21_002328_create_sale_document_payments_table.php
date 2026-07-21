<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sale_document_payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('sale_document_id')
                ->constrained('sale_documents')
                ->cascadeOnDelete();
            $table->foreignUuid('cash_register_id')
                ->constrained('sale_cash_registers')
                ->restrictOnDelete();
            $table->foreignUuid('payment_method_id')
                ->constrained('shared_payment_methods')
                ->restrictOnDelete();
            $table->unsignedBigInteger('amount')->default(0);
            $table->timestamp('paid_at');
            $table->foreignUuid('created_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('sale_document_id', 'sale_document_payments_document_idx');
            $table->index('cash_register_id', 'sale_document_payments_cash_register_idx');
            $table->index('payment_method_id', 'sale_document_payments_method_idx');
            $table->index('paid_at', 'sale_document_payments_paid_at_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sale_document_payments');
    }
};
