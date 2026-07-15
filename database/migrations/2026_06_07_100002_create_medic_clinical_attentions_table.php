<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medic_clinical_attentions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')
                ->constrained('configuration_companies')
                ->cascadeOnDelete();
            $table->foreignUuid('appointment_id')
                ->nullable()
                ->constrained('agenda_appointments')
                ->nullOnDelete();
            $table->foreignUuid('template_id')
                ->constrained('medic_clinical_templates')
                ->restrictOnDelete();
            $table->foreignUuid('patient_id')
                ->constrained('medic_patients')
                ->restrictOnDelete();
            $table->foreignUuid('doctor_id')
                ->constrained('medic_doctors')
                ->restrictOnDelete();
            $table->foreignUuid('created_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->foreignUuid('updated_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamps();

            $table->index('company_id', 'medic_clinical_attentions_company_id_idx');
            $table->index('appointment_id', 'medic_clinical_attentions_appointment_id_idx');
            $table->index('patient_id', 'medic_clinical_attentions_patient_id_idx');
            $table->index('doctor_id', 'medic_clinical_attentions_doctor_id_idx');
            $table->index('template_id', 'medic_clinical_attentions_template_id_idx');
            $table->index('created_at', 'medic_clinical_attentions_created_at_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medic_clinical_attentions');
    }
};
