<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('store_inventory_movements', function (Blueprint $table) {
            $table->string('origin_type', 64)->nullable()->after('user_id');
            $table->uuid('origin_id')->nullable()->after('origin_type');
            $table->foreignUuid('reversed_movement_id')
                ->nullable()
                ->after('origin_id')
                ->constrained('store_inventory_movements')
                ->nullOnDelete();

            $table->index(
                ['company_id', 'origin_type', 'origin_id'],
                'store_inventory_movements_origin_idx',
            );
            $table->index(
                'reversed_movement_id',
                'store_inventory_movements_reversed_movement_id_idx',
            );
        });
    }

    public function down(): void
    {
        Schema::table('store_inventory_movements', function (Blueprint $table) {
            $table->dropForeign(['reversed_movement_id']);
            $table->dropIndex('store_inventory_movements_origin_idx');
            $table->dropIndex('store_inventory_movements_reversed_movement_id_idx');
            $table->dropColumn(['origin_type', 'origin_id', 'reversed_movement_id']);
        });
    }
};
