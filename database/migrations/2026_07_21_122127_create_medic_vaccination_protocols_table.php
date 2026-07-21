<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medic_vaccination_protocols', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')
                ->constrained('configuration_companies')
                ->cascadeOnDelete();
            $table->foreignUuid('species_id')
                ->constrained('medic_species')
                ->restrictOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->unsignedSmallInteger('version')->default(1);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('company_id', 'medic_vaccination_protocols_company_id_idx');
            $table->index('species_id', 'medic_vaccination_protocols_species_id_idx');
            $table->index('is_active', 'medic_vaccination_protocols_is_active_idx');
            $table->unique(['company_id', 'name'], 'medic_vaccination_protocols_company_name_uq');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medic_vaccination_protocols');
    }
};
