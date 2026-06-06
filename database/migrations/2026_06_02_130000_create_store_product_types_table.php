<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('store_product_types', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')
                ->nullable()
                ->constrained('configuration_companies')
                ->cascadeOnDelete();
            $table->string('name');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['company_id', 'name'], 'store_product_types_company_name_unique');
            $table->index('company_id', 'store_product_types_company_id_idx');
            $table->index('is_active', 'store_product_types_is_active_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('store_product_types');
    }
};
