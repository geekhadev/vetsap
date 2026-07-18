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
        Schema::create('purchase_order_statuses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')
                ->nullable()
                ->constrained('configuration_companies')
                ->cascadeOnDelete();
            $table->string('name');
            $table->string('color', 32);
            $table->boolean('is_global')->default(false);
            $table->timestamps();

            $table->unique(['company_id', 'name'], 'purchase_order_statuses_company_name_unique');
            $table->index('company_id', 'purchase_order_statuses_company_id_idx');
            $table->index('is_global', 'purchase_order_statuses_is_global_idx');
            $table->index('color', 'purchase_order_statuses_color_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_order_statuses');
    }
};
