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
        Schema::create('medic_patients', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')
                ->constrained('configuration_companies')
                ->cascadeOnDelete();
            $table->foreignUuid('customer_id')
                ->constrained('sale_customers')
                ->cascadeOnDelete();
            $table->foreignUuid('species_id')
                ->constrained('medic_species')
                ->restrictOnDelete();
            $table->string('record_number', 50);
            $table->string('name');
            $table->string('breed')->nullable();
            $table->enum('sex', ['male', 'female', 'unknown']);
            $table->date('birth_date')->nullable();
            $table->decimal('weight_kg', 8, 2)->nullable();
            $table->boolean('is_sterilized')->default(false);
            $table->string('colors', 500)->nullable();
            $table->string('blood_type', 50)->nullable();
            $table->string('microchip_number', 50)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(
                ['company_id', 'record_number'],
                'medic_patients_company_record_number_unique',
            );
            $table->unique(
                ['company_id', 'microchip_number'],
                'medic_patients_company_microchip_unique',
            );
            $table->index('company_id', 'medic_patients_company_id_idx');
            $table->index('customer_id', 'medic_patients_customer_id_idx');
            $table->index('species_id', 'medic_patients_species_id_idx');
            $table->index('is_active', 'medic_patients_is_active_idx');
            $table->index('created_at', 'medic_patients_created_at_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medic_patients');
    }
};
