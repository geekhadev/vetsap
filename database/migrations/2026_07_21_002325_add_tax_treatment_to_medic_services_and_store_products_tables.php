<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('medic_services', function (Blueprint $table) {
            $table->string('tax_treatment', 20)
                ->default('exempt')
                ->after('price');
            $table->index('tax_treatment', 'medic_services_tax_treatment_idx');
        });

        Schema::table('store_products', function (Blueprint $table) {
            $table->string('tax_treatment', 20)
                ->default('taxable')
                ->after('price');
            $table->index('tax_treatment', 'store_products_tax_treatment_idx');
        });
    }

    public function down(): void
    {
        Schema::table('medic_services', function (Blueprint $table) {
            $table->dropIndex('medic_services_tax_treatment_idx');
            $table->dropColumn('tax_treatment');
        });

        Schema::table('store_products', function (Blueprint $table) {
            $table->dropIndex('store_products_tax_treatment_idx');
            $table->dropColumn('tax_treatment');
        });
    }
};
