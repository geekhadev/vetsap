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
        Schema::create('sale_sii_caf_folios', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('sale_sii_caf_id')
                ->constrained('sale_sii_cafs')
                ->cascadeOnDelete();
            $table->foreignUuid('company_id')
                ->constrained('configuration_companies')
                ->cascadeOnDelete();
            $table->unsignedInteger('folio_number');
            $table->enum('status', ['available', 'draft', 'used', 'expired'])->default('available');
            $table->timestamp('used_at')->nullable();
            $table->timestamps();

            $table->unique(['sale_sii_caf_id', 'folio_number'], 'sale_sii_caf_folios_caf_folio_unique');
            $table->index(['company_id', 'status'], 'sale_sii_caf_folios_company_status_idx');
            $table->index(['sale_sii_caf_id', 'status'], 'sale_sii_caf_folios_caf_status_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sale_sii_caf_folios');
    }
};
