<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('store_products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')
                ->constrained('configuration_companies')
                ->cascadeOnDelete();
            $table->foreignUuid('product_category_id')
                ->constrained('store_product_categories')
                ->restrictOnDelete();
            $table->foreignUuid('product_type_id')
                ->constrained('store_product_types')
                ->restrictOnDelete();
            $table->string('name');
            $table->string('barcode', 64)->nullable();
            $table->text('description')->nullable();
            $table->decimal('price', 12, 0)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['company_id', 'name'], 'store_products_company_name_unique');
            $table->unique(['company_id', 'barcode'], 'store_products_company_barcode_unique');
            $table->index('company_id', 'store_products_company_id_idx');
            $table->index(['company_id', 'product_category_id'], 'store_products_company_category_idx');
            $table->index(['company_id', 'product_type_id'], 'store_products_company_type_idx');
            $table->index('product_category_id', 'store_products_category_id_idx');
            $table->index('product_type_id', 'store_products_type_id_idx');
            $table->index('is_active', 'store_products_is_active_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('store_products');
    }
};
