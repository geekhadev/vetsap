<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_order_details', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('purchase_order_id')
                ->constrained('purchase_orders')
                ->cascadeOnDelete();
            $table->foreignUuid('product_id')
                ->constrained('store_products')
                ->restrictOnDelete();
            $table->unsignedInteger('quantity');
            $table->decimal('unit_price', 12, 0);
            $table->decimal('total', 12, 0);
            $table->timestamps();

            $table->index('purchase_order_id', 'purchase_order_details_order_id_idx');
            $table->index('product_id', 'purchase_order_details_product_id_idx');
            $table->unique(
                ['purchase_order_id', 'product_id'],
                'purchase_order_details_order_product_unique',
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_order_details');
    }
};
