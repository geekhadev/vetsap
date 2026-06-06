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
        Schema::create('medic_doctors', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')
                ->constrained('configuration_companies')
                ->cascadeOnDelete();
            $table->enum('document_type', ['rut', 'pasaporte']);
            $table->string('document_number', 20);
            $table->string('first_name');
            $table->string('last_name');
            $table->string('phone', 50)->nullable();
            $table->string('email')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('use_web')->default(false);
            $table->timestamps();

            $table->unique(
                ['company_id', 'document_type', 'document_number'],
                'medic_doctors_company_document_unique',
            );
            $table->index('company_id', 'medic_doctors_company_idx');
            $table->index(['company_id', 'is_active'], 'medic_doctors_company_active_idx');
            $table->index(['company_id', 'use_web'], 'medic_doctors_company_use_web_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medic_doctors');
    }
};
