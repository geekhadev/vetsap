<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        $vaccinesCategoryId = $this->ensureGlobalVaccinesCategory();

        if (
            Schema::hasTable('store_product_types')
            && Schema::hasColumn('store_products', 'product_type_id')
        ) {
            $vaccinesTypeId = DB::table('store_product_types')
                ->whereNull('company_id')
                ->where('name', 'Vacunas')
                ->value('id');

            if (is_string($vaccinesTypeId) && $vaccinesTypeId !== '') {
                DB::table('store_products')
                    ->where('product_type_id', $vaccinesTypeId)
                    ->update(['product_category_id' => $vaccinesCategoryId]);
            }

            Schema::table('store_products', function (Blueprint $table): void {
                $table->dropIndex('store_products_company_type_idx');
                $table->dropIndex('store_products_type_id_idx');
                $table->dropConstrainedForeignId('product_type_id');
            });
        }

        Schema::dropIfExists('store_product_types');
    }

    public function down(): void
    {
        Schema::create('store_product_types', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')
                ->nullable()
                ->constrained('companies')
                ->nullOnDelete();
            $table->string('name');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['company_id', 'name'], 'store_product_types_company_name_unique');
            $table->index('company_id', 'store_product_types_company_id_idx');
            $table->index('is_active', 'store_product_types_is_active_idx');
        });

        Schema::table('store_products', function (Blueprint $table): void {
            $table->foreignUuid('product_type_id')
                ->nullable()
                ->after('product_category_id')
                ->constrained('store_product_types')
                ->restrictOnDelete();

            $table->index(['company_id', 'product_type_id'], 'store_products_company_type_idx');
            $table->index('product_type_id', 'store_products_type_id_idx');
        });
    }

    private function ensureGlobalVaccinesCategory(): string
    {
        $existingId = DB::table('store_product_categories')
            ->whereNull('company_id')
            ->where('name', 'Vacunas')
            ->value('id');

        if (is_string($existingId) && $existingId !== '') {
            return $existingId;
        }

        $id = (string) Str::uuid();

        DB::table('store_product_categories')->insert([
            'id' => $id,
            'company_id' => null,
            'name' => 'Vacunas',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $id;
    }
};
