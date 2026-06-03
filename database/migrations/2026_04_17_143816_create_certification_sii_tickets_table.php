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
        Schema::create('sale_certification_sii_tickets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')
                ->constrained('configuration_companies')
                ->cascadeOnDelete();
            $table->foreignUuid('user_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->unsignedInteger('number');
            $table->string('dte_init');
            $table->string('dte_end');
            $table->string('file_caf');
            $table->string('file_envio_dte');
            $table->string('file_consumo_folios');
            $table->timestamps();

            $table->unique(['company_id', 'dte_init', 'dte_end'], 'sale_cert_sii_tickets_company_folio_unique');
            $table->index(['company_id', 'created_at'], 'sale_cert_sii_tickets_company_created_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sale_certification_sii_tickets');
    }
};
