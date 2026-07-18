<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')
                ->constrained('configuration_companies')
                ->cascadeOnDelete();
            $table->date('ordered_at');
            $table->foreignUuid('supplier_id')
                ->constrained('purchase_suppliers')
                ->restrictOnDelete();
            $table->foreignUuid('purchase_order_status_id')
                ->constrained('purchase_order_statuses')
                ->restrictOnDelete();
            $table->decimal('total', 12, 0);
            $table->timestamps();

            $table->index('company_id', 'purchase_orders_company_id_idx');
            $table->index(['company_id', 'ordered_at'], 'purchase_orders_company_ordered_at_idx');
            $table->index('supplier_id', 'purchase_orders_supplier_id_idx');
            $table->index('purchase_order_status_id', 'purchase_orders_status_id_idx');
            $table->index('ordered_at', 'purchase_orders_ordered_at_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_orders');
    }
};
