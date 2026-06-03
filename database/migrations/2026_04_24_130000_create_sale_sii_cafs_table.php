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
        Schema::create('sale_sii_cafs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')
                ->constrained('configuration_companies')
                ->cascadeOnDelete();
            $table->foreignUuid('sii_tax_document_type_id')
                ->constrained('shared_sii_tax_document_types')
                ->restrictOnDelete();
            $table->string('sii_document_type_code', 16);
            $table->unsignedInteger('folio_from');
            $table->unsignedInteger('folio_to');
            $table->date('authorized_at');
            $table->date('expires_at');
            $table->enum('status', ['active', 'expired', 'cancelled'])->default('active');
            $table->string('xml_path');
            $table->timestamp('uploaded_at');
            $table->timestamps();

            $table->index('company_id', 'sale_sii_cafs_company_id_idx');
            $table->index(['company_id', 'status'], 'sale_sii_cafs_company_status_idx');
            $table->index(['company_id', 'sii_tax_document_type_id'], 'sale_sii_cafs_company_doc_type_idx');
            $table->unique(
                ['company_id', 'sii_tax_document_type_id', 'folio_from', 'folio_to'],
                'sale_sii_cafs_company_type_range_unique',
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sale_sii_cafs');
    }
};
