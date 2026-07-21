<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sale_document_details', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('sale_document_id')
                ->constrained('sale_documents')
                ->cascadeOnDelete();
            $table->string('detail_type', 20);
            $table->foreignUuid('service_id')
                ->nullable()
                ->constrained('medic_services')
                ->nullOnDelete();
            $table->foreignUuid('product_id')
                ->nullable()
                ->constrained('store_products')
                ->nullOnDelete();
            $table->foreignUuid('clinical_attention_id')
                ->nullable()
                ->constrained('medic_clinical_attentions')
                ->nullOnDelete();
            $table->string('description');
            $table->unsignedInteger('quantity')->default(1);
            $table->unsignedBigInteger('unit_price')->default(0);
            $table->decimal('discount_percent', 5, 2)->default(0);
            $table->unsignedBigInteger('discount_amount')->default(0);
            $table->string('tax_treatment', 20);
            $table->decimal('tax_percent', 5, 2)->default(0);
            $table->unsignedBigInteger('gross_amount')->default(0);
            $table->unsignedBigInteger('net_amount')->default(0);
            $table->unsignedBigInteger('exempt_amount')->default(0);
            $table->unsignedBigInteger('tax_amount')->default(0);
            $table->unsignedBigInteger('detail_total')->default(0);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index('sale_document_id', 'sale_document_details_document_idx');
            $table->index('detail_type', 'sale_document_details_type_idx');
            $table->index('service_id', 'sale_document_details_service_idx');
            $table->index('product_id', 'sale_document_details_product_idx');
            $table->index('clinical_attention_id', 'sale_document_details_attention_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sale_document_details');
    }
};
