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
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['specialty_id', 'is_active'], 'medic_services_specialty_active_idx');
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
