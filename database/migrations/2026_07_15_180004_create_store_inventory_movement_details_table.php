<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('store_inventory_movement_details', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('inventory_movement_id')
                ->constrained('store_inventory_movements')
                ->cascadeOnDelete();
            $table->foreignUuid('product_id')
                ->constrained('store_products')
                ->restrictOnDelete();
            $table->unsignedInteger('quantity');
            $table->timestamps();

            $table->index('inventory_movement_id', 'store_inventory_movement_details_movement_id_idx');
            $table->index('product_id', 'store_inventory_movement_details_product_id_idx');
            $table->unique(
                ['inventory_movement_id', 'product_id'],
                'store_inventory_movement_details_movement_product_unique',
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('store_inventory_movement_details');
    }
};
