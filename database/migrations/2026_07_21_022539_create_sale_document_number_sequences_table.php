<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sale_document_number_sequences', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')
                ->constrained('configuration_companies')
                ->cascadeOnDelete();
            $table->foreignUuid('sii_tax_document_type_id')
                ->constrained('shared_sii_tax_document_types')
                ->restrictOnDelete();
            $table->unsignedBigInteger('last_number')->default(0);
            $table->timestamps();

            $table->unique(
                ['company_id', 'sii_tax_document_type_id'],
                'sale_document_number_sequences_company_type_unique',
            );
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sale_document_number_sequences');
    }
};
