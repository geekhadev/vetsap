<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('medic_clinical_attentions', function (Blueprint $table) {
            $table->string('status', 20)->default('closed')->after('doctor_id');
            $table->index(['patient_id', 'status'], 'medic_clinical_attentions_patient_status_idx');
        });

        Schema::table('medic_clinical_attentions', function (Blueprint $table) {
            $table->foreignUuid('doctor_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('medic_clinical_attentions', function (Blueprint $table) {
            $table->dropIndex('medic_clinical_attentions_patient_status_idx');
            $table->dropColumn('status');
        });

        Schema::table('medic_clinical_attentions', function (Blueprint $table) {
            $table->foreignUuid('doctor_id')->nullable(false)->change();
        });
    }
};
