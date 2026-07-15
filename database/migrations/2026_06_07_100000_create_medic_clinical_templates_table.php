<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medic_clinical_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')
                ->constrained('configuration_companies')
                ->cascadeOnDelete();
            $table->foreignUuid('species_id')
                ->nullable()
                ->constrained('medic_species')
                ->nullOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('company_id', 'medic_clinical_templates_company_id_idx');
            $table->index('species_id', 'medic_clinical_templates_species_id_idx');
            $table->index(['company_id', 'is_default'], 'medic_clinical_templates_company_default_idx');
            $table->index('is_active', 'medic_clinical_templates_is_active_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medic_clinical_templates');
    }
};
