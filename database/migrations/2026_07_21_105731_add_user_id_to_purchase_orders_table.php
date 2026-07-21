<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->foreignUuid('user_id')
                ->nullable()
                ->after('purchase_order_status_id')
                ->constrained('users')
                ->nullOnDelete();

            $table->index('user_id', 'purchase_orders_user_id_idx');
        });
    }

    public function down(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropIndex('purchase_orders_user_id_idx');
            $table->dropColumn('user_id');
        });
    }
};
