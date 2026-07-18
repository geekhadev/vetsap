<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Production may have already run the stub that created a bare `suppliers`
 * table. Fresh installs create `purchase_suppliers` in the original migration.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('suppliers');

        if (Schema::hasTable('purchase_suppliers')) {
            return;
        }

        Schema::create('purchase_suppliers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')
                ->constrained('configuration_companies')
                ->cascadeOnDelete();
            $table->string('name');
            $table->enum('document_type', ['rut', 'pasaporte']);
            $table->string('document_number', 20);
            $table->string('email')->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('address', 500)->nullable();
            $table->timestamps();

            $table->index('company_id', 'purchase_suppliers_company_id_idx');
            $table->index('name', 'purchase_suppliers_name_idx');
            $table->unique(
                ['company_id', 'document_type', 'document_number'],
                'purchase_suppliers_company_document_unique',
            );
        });
    }

    public function down(): void
    {
        // Intentionally empty: rolling this back would drop a table that may
        // have been created by the original create_purchase_suppliers migration.
    }
};
