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
        Schema::create('medic_services', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')
                ->constrained('configuration_companies')
                ->cascadeOnDelete();
            $table->foreignUuid('specialty_id')
                ->constrained('medic_specialties')
                ->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 12, 0)->nullable();
            $table->unsignedInteger('duration_minutes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('use_web')->default(false);
            $table->timestamps();

            $table->unique(['company_id', 'name'], 'medic_services_company_name_unique');
            $table->index(['company_id', 'specialty_id'], 'medic_services_company_specialty_idx');
            $table->index(['specialty_id', 'is_active'], 'medic_services_specialty_active_idx');
            $table->index('is_active', 'medic_services_is_active_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medic_services');
    }
};
