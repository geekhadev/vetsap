<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('store_inventory_movements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')
                ->constrained('configuration_companies')
                ->cascadeOnDelete();
            $table->string('type', 16);
            $table->unsignedBigInteger('number');
            $table->date('moved_at');
            $table->foreignUuid('movement_category_id')
                ->constrained('store_movement_categories')
                ->restrictOnDelete();
            $table->foreignUuid('user_id')
                ->constrained('users')
                ->restrictOnDelete();
            $table->timestamps();

            $table->unique(['company_id', 'type', 'number'], 'store_inventory_movements_company_type_number_unique');
            $table->index('company_id', 'store_inventory_movements_company_id_idx');
            $table->index(['company_id', 'type'], 'store_inventory_movements_company_type_idx');
            $table->index(['company_id', 'moved_at'], 'store_inventory_movements_company_moved_at_idx');
            $table->index('movement_category_id', 'store_inventory_movements_category_id_idx');
            $table->index('user_id', 'store_inventory_movements_user_id_idx');
            $table->index('type', 'store_inventory_movements_type_idx');
            $table->index('moved_at', 'store_inventory_movements_moved_at_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('store_inventory_movements');
    }
};
