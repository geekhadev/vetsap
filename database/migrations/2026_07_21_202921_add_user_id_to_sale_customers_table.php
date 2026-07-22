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
        Schema::table('sale_customers', function (Blueprint $table) {
            $table->foreignUuid('user_id')
                ->nullable()
                ->after('company_id')
                ->constrained('users')
                ->nullOnDelete();

            $table->index('user_id', 'sale_customers_user_id_idx');
            $table->unique(['company_id', 'user_id'], 'sale_customers_company_user_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sale_customers', function (Blueprint $table) {
            $table->dropUnique('sale_customers_company_user_unique');
            $table->dropIndex('sale_customers_user_id_idx');
            $table->dropConstrainedForeignId('user_id');
        });
    }
};
