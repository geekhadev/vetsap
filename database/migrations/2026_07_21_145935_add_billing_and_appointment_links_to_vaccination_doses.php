<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('medic_patient_vaccination_doses', function (Blueprint $table) {
            $table->foreignUuid('appointment_id')
                ->nullable()
                ->after('recorded_by')
                ->constrained('agenda_appointments')
                ->nullOnDelete();
            $table->foreignUuid('clinical_attention_id')
                ->nullable()
                ->after('appointment_id')
                ->constrained('medic_clinical_attentions')
                ->nullOnDelete();

            $table->index('appointment_id', 'medic_patient_vaccination_doses_appointment_id_idx');
            $table->index('clinical_attention_id', 'medic_patient_vaccination_doses_attention_id_idx');
        });

        Schema::table('sale_document_details', function (Blueprint $table) {
            $table->foreignUuid('patient_vaccination_dose_id')
                ->nullable()
                ->after('clinical_attention_id')
                ->constrained('medic_patient_vaccination_doses')
                ->nullOnDelete();

            $table->unique(
                'patient_vaccination_dose_id',
                'sale_document_details_vaccination_dose_id_uq',
            );
        });
    }

    public function down(): void
    {
        Schema::table('sale_document_details', function (Blueprint $table) {
            $table->dropUnique('sale_document_details_vaccination_dose_id_uq');
            $table->dropConstrainedForeignId('patient_vaccination_dose_id');
        });

        Schema::table('medic_patient_vaccination_doses', function (Blueprint $table) {
            $table->dropConstrainedForeignId('appointment_id');
            $table->dropConstrainedForeignId('clinical_attention_id');
        });
    }
};
