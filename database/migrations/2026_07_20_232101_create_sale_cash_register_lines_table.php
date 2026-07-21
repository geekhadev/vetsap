<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sale_cash_register_lines', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('cash_register_id')
                ->constrained('sale_cash_registers')
                ->cascadeOnDelete();
            $table->foreignUuid('payment_method_id')
                ->constrained('shared_payment_methods')
                ->restrictOnDelete();
            $table->unsignedBigInteger('system_amount')->default(0);
            $table->unsignedBigInteger('declared_amount')->default(0);
            $table->bigInteger('difference')->default(0);
            $table->timestamps();

            $table->unique(
                ['cash_register_id', 'payment_method_id'],
                'sale_cash_register_lines_register_method_unique',
            );
            $table->index('cash_register_id', 'sale_cash_register_lines_register_id_idx');
            $table->index('payment_method_id', 'sale_cash_register_lines_method_id_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sale_cash_register_lines');
    }
};
