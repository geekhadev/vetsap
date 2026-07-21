<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sale_documents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')
                ->constrained('configuration_companies')
                ->cascadeOnDelete();
            $table->foreignUuid('office_id')
                ->nullable()
                ->constrained('configuration_company_offices')
                ->nullOnDelete();
            $table->foreignUuid('customer_id')
                ->constrained('sale_customers')
                ->restrictOnDelete();
            $table->foreignUuid('clinical_attention_id')
                ->nullable()
                ->constrained('medic_clinical_attentions')
                ->nullOnDelete();
            $table->foreignUuid('cash_register_id')
                ->nullable()
                ->constrained('sale_cash_registers')
                ->nullOnDelete();
            $table->foreignUuid('sii_tax_document_type_id')
                ->nullable()
                ->constrained('shared_sii_tax_document_types')
                ->nullOnDelete();
            $table->uuid('merged_into_sale_document_id')->nullable();
            $table->string('status', 20);
            $table->string('document_number', 64)->nullable();
            $table->timestamp('issued_at')->nullable();

            $table->string('customer_name');
            $table->string('customer_document_type', 32)->nullable();
            $table->string('customer_document_number', 64)->nullable();
            $table->string('customer_phone', 64)->nullable();
            $table->string('customer_email')->nullable();
            $table->string('customer_address', 512)->nullable();

            $table->decimal('tax_percent', 5, 2)->default(0);
            $table->unsignedBigInteger('tax_amount')->default(0);

            $table->decimal('details_discount_percent', 5, 2)->default(0);
            $table->unsignedBigInteger('details_discount_amount')->default(0);
            $table->unsignedBigInteger('details_discount_net_amount')->default(0);
            $table->unsignedBigInteger('details_discount_exempt_amount')->default(0);

            $table->decimal('global_discount_percent', 5, 2)->default(0);
            $table->unsignedBigInteger('global_discount_amount')->default(0);
            $table->unsignedBigInteger('global_discount_net_amount')->default(0);
            $table->unsignedBigInteger('global_discount_exempt_amount')->default(0);

            $table->unsignedBigInteger('gross_net_amount')->default(0);
            $table->unsignedBigInteger('gross_exempt_amount')->default(0);
            $table->unsignedBigInteger('net_amount')->default(0);
            $table->unsignedBigInteger('exempt_amount')->default(0);
            $table->unsignedBigInteger('total_amount')->default(0);
            $table->unsignedBigInteger('paid_amount')->default(0);

            $table->text('notes')->nullable();
            $table->foreignUuid('created_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->foreignUuid('updated_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamps();

            $table->index(['company_id', 'status'], 'sale_documents_company_status_idx');
            $table->index(['company_id', 'customer_id', 'status'], 'sale_documents_company_customer_status_idx');
            $table->index('clinical_attention_id', 'sale_documents_attention_idx');
            $table->index('cash_register_id', 'sale_documents_cash_register_idx');
            $table->index('issued_at', 'sale_documents_issued_at_idx');
            $table->index('created_at', 'sale_documents_created_at_idx');
            $table->index('merged_into_sale_document_id', 'sale_documents_merged_into_idx');
        });

        Schema::table('sale_documents', function (Blueprint $table) {
            $table->foreign('merged_into_sale_document_id', 'sale_documents_merged_into_foreign')
                ->references('id')
                ->on('sale_documents')
                ->nullOnDelete();
        });

        $driver = Schema::getConnection()->getDriverName();

        if (in_array($driver, ['pgsql', 'sqlite'], true)) {
            DB::statement(
                'CREATE UNIQUE INDEX sale_documents_one_draft_per_attention '
                .'ON sale_documents (clinical_attention_id) '
                ."WHERE status = 'draft' AND clinical_attention_id IS NOT NULL"
            );
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('sale_documents');
    }
};
