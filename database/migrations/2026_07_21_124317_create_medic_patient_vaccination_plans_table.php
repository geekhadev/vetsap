<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medic_patient_vaccination_plans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')
                ->constrained('configuration_companies')
                ->cascadeOnDelete();
            $table->foreignUuid('patient_id')
                ->constrained('medic_patients')
                ->cascadeOnDelete();
            $table->foreignUuid('protocol_id')
                ->constrained('medic_vaccination_protocols')
                ->restrictOnDelete();
            $table->json('protocol_snapshot');
            $table->timestamp('assigned_at');
            $table->foreignUuid('assigned_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamps();

            $table->unique('patient_id', 'medic_patient_vaccination_plans_patient_id_uq');
            $table->index('company_id', 'medic_patient_vaccination_plans_company_id_idx');
            $table->index('protocol_id', 'medic_patient_vaccination_plans_protocol_id_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medic_patient_vaccination_plans');
    }
};
